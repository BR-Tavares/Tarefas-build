// Controlador principal do PWA de Missões (v1)
// Um só link para todos: o papel vem do cadastro em equipes/{equipeId}.

import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  db,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
} from './firebase-config.js';
import { FERIADOS_NACIONAIS_PADRAO } from './feriados.js';
import { situacao } from './analise.js';
import { montarObjetosAnalise } from './adaptador.js';
import { esc, mostrarAviso } from './dom.js';
import { renderizarTelaEquipe } from './tela-equipe.js';
import { renderizarTelaNovaMissao } from './tela-nova-missao.js';
import { renderizarTelaFolha } from './tela-folha.js';
import { renderizarTelaPainel } from './tela-painel.js';
import { registrarTokenNotificacao } from './notificacoes.js';

const paramsUrl = new URLSearchParams(window.location.search);
const EQUIPE_ID = paramsUrl.get('equipe') || 'principal';

const estadoApp = {
  equipeId: EQUIPE_ID,
  usuario: null,
  papel: null, // 'gestor' | 'responsavel' | 'nao_cadastrado'
  equipe: null,
  membros: {},
  missoesMap: {},
  subcolecoesMap: {},
  telaAtual: 'painel', // 'painel' | 'folha' | 'nova-missao' | 'equipe'
  missaoAbertaId: null,
  opcoesEdicaoMissao: null,
};

let unsubsPrincipais = [];
const unsubsPorMissao = new Map();

function limparListeners() {
  unsubsPrincipais.forEach((u) => u());
  unsubsPrincipais = [];
  for (const lista of unsubsPorMissao.values()) {
    lista.forEach((u) => u());
  }
  unsubsPorMissao.clear();
}

// Registra o Service Worker do PWA para funcionamento offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

getRedirectResult(auth).catch(() => {});

onAuthStateChanged(auth, async (user) => {
  limparListeners();
  estadoApp.usuario = user;
  estadoApp.papel = null;
  estadoApp.equipe = null;
  estadoApp.membros = {};
  estadoApp.missoesMap = {};
  estadoApp.subcolecoesMap = {};

  if (!user) {
    renderizarTelaLogin();
    return;
  }

  await descobrirPapelEIniciar(user);
});

function renderizarTelaLogin() {
  const topbar = document.getElementById('topbar');
  if (topbar) topbar.style.display = 'none';
  const root = document.getElementById('app-root');

  root.innerHTML = `
    <div class="container-folha" style="margin-top:48px;">
      <div class="card" style="text-align:center;padding:28px 20px;">
        <img src="/icon.svg" alt="Missões" width="56" height="56" style="margin-bottom:12px;" />
        <h1 class="titulo-missao" style="margin-bottom:6px;">App de Missões</h1>
        <p class="texto-campo" style="color:var(--muted);margin-bottom:20px;">
          Folha única por missão · O gestor define o quê; o responsável define o como.
        </p>
        <button type="button" id="btn-login-google" class="btn btn-primario" style="width:100%;height:40px;font-size:13.5px;margin-bottom:10px;">
          Entrar com conta Google
        </button>
        <button type="button" id="btn-ver-exemplo-login" class="btn btn-outline-azul" style="width:100%;height:36px;font-size:12.5px;">
          Ver exemplo didático da folha (sem login) ↗
        </button>
      </div>
    </div>
  `;

  root.querySelector('#btn-ver-exemplo-login')?.addEventListener('click', () => {
    import('./tela-folha.js').then(({ renderizarTelaFolha }) => {
      renderizarTelaFolha(root, { ...estadoApp, papel: 'gestor' }, {
        missaoId: 'MS-000',
        somenteLeitura: true,
        aoVoltar: () => renderizarTelaLogin(),
      });
    });
  });

  root.querySelector('#btn-login-google')?.addEventListener('click', async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        mostrarAviso('Não foi possível entrar: ' + err.message, 'erro');
      }
    }
  });
}

async function descobrirPapelEIniciar(user) {
  const email = (user.email || '').toLowerCase();
  const equipeRef = doc(db, 'equipes', EQUIPE_ID);

  try {
    const snapEquipe = await getDoc(equipeRef);
    if (!snapEquipe.exists()) {
      renderizarTelaNaoCadastradoOuCriarEquipe(user, true);
      return;
    }

    const dadosEquipe = snapEquipe.data();
    estadoApp.equipe = dadosEquipe;

    if (dadosEquipe.gestorUid === user.uid) {
      estadoApp.papel = 'gestor';
      iniciarModoGestor(user);
      return;
    }

    const snapMembro = await getDoc(doc(db, 'equipes', EQUIPE_ID, 'membros', email));
    if (snapMembro.exists() && snapMembro.data().ativo === true) {
      estadoApp.papel = 'responsavel';
      estadoApp.membros[email] = snapMembro.data();
      iniciarModoResponsavel(user);
      return;
    }

    renderizarTelaNaoCadastradoOuCriarEquipe(user, false);
  } catch (err) {
    // Quando firestore.rules bloqueia a leitura de equipes/{id}, a pessoa não faz parte da equipe
    // (ou a equipe ainda não foi criada no banco).
    renderizarTelaNaoCadastradoOuCriarEquipe(user, false);
  }
}

function renderizarTelaNaoCadastradoOuCriarEquipe(user, sabemosQueNaoExiste) {
  estadoApp.papel = 'nao_cadastrado';
  renderizarTopbar();
  const root = document.getElementById('app-root');

  root.innerHTML = `
    <div class="container-folha" style="margin-top:28px;">
      <div class="card">
        <h2 class="secao-titulo" style="font-size:16px;margin-bottom:8px;">
          Peça ao gestor para incluir você
        </h2>
        <p class="texto-campo" style="color:var(--muted);">
          Sua conta Google (<strong>${esc(user.email)}</strong>) ainda não está cadastrada como membro ativo nesta equipe.
          Envie este e-mail ao gestor para que ele inclua você na tela <strong>Equipe</strong>.
        </p>
      </div>

      <div class="card" style="background:#F8FAFC;">
        <h3 class="secao-titulo" style="margin-bottom:6px;">
          ${sabemosQueNaoExiste ? 'Primeiro acesso: Criar equipe' : 'É o gestor no primeiro acesso?'}
        </h3>
        <p class="secao-sub" style="margin-bottom:10px;">
          Se a equipe ainda não foi criada neste projeto, crie-a abaixo para assumir o papel de gestor.
        </p>
        <form id="form-criar-equipe" style="display:flex;gap:8px;flex-wrap:wrap;">
          <input
            id="inp-nome-equipe"
            class="input"
            type="text"
            value="Equipe Principal"
            placeholder="Nome da equipe"
            style="flex:1;"
            required
          />
          <button type="submit" class="btn btn-primario">Criar equipe</button>
        </form>
      </div>
    </div>
  `;

  root.querySelector('#form-criar-equipe')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = root.querySelector('#inp-nome-equipe').value.trim() || 'Equipe Principal';
    try {
      await setDoc(doc(db, 'equipes', EQUIPE_ID), {
        nome,
        gestorUid: user.uid,
        gestorEmail: (user.email || '').toLowerCase(),
        proximoNumero: 1,
        feriados: FERIADOS_NACIONAIS_PADRAO,
      });
      mostrarAviso('Equipe criada com sucesso! Você é o gestor.', 'sucesso');
      await descobrirPapelEIniciar(user);
    } catch (err) {
      mostrarAviso(
        'Esta equipe já possui um gestor cadastrado. Peça a ele para incluir seu e-mail.',
        'erro'
      );
    }
  });
}

function renderizarTopbar() {
  const topbar = document.getElementById('topbar');
  const brandTitulo = document.getElementById('brand-titulo');
  const nav = document.getElementById('nav-acoes');
  if (!topbar || !nav) return;

  topbar.style.display = '';
  brandTitulo.textContent = estadoApp.equipe?.nome
    ? `Missões · ${estadoApp.equipe.nome}`
    : 'Missões';

  const podeNotificar =
    'Notification' in window && Notification.permission !== 'granted';

  if (estadoApp.papel === 'gestor') {
    nav.innerHTML = `
      <button type="button" class="btn btn-sm ${estadoApp.telaAtual === 'painel' ? 'btn-primario' : ''}" id="nav-btn-painel">
        Lista e Painel
      </button>
      <button type="button" class="btn btn-sm ${estadoApp.telaAtual === 'nova-missao' ? 'btn-primario' : ''}" id="nav-btn-nova">
        + Nova missão
      </button>
      <button type="button" class="btn btn-sm ${estadoApp.telaAtual === 'equipe' ? 'btn-primario' : ''}" id="nav-btn-equipe">
        Equipe
      </button>
      ${
        podeNotificar
          ? `<button type="button" class="btn btn-sm btn-outline-azul" id="nav-btn-notif" title="Receber avisos de pendências, entregas e sinais">Ativar avisos 🔔</button>`
          : ''
      }
      <button type="button" class="btn btn-sm" id="nav-btn-sair">Sair</button>
    `;

    nav.querySelector('#nav-btn-painel')?.addEventListener('click', () => {
      estadoApp.telaAtual = 'painel';
      estadoApp.missaoAbertaId = null;
      atualizarTela();
    });
    nav.querySelector('#nav-btn-nova')?.addEventListener('click', () => {
      estadoApp.telaAtual = 'nova-missao';
      estadoApp.opcoesEdicaoMissao = {};
      atualizarTela();
    });
    nav.querySelector('#nav-btn-equipe')?.addEventListener('click', () => {
      estadoApp.telaAtual = 'equipe';
      atualizarTela();
    });
  } else if (estadoApp.papel === 'responsavel') {
    nav.innerHTML = `
      <span class="secao-sub">${esc(estadoApp.usuario?.email || '')}</span>
      ${
        podeNotificar
          ? `<button type="button" class="btn btn-sm btn-outline-azul" id="nav-btn-notif" title="Receber avisos de novas missões e respostas do gestor">Ativar avisos 🔔</button>`
          : ''
      }
      <button type="button" class="btn btn-sm" id="nav-btn-sair">Sair</button>
    `;
  } else {
    nav.innerHTML = `
      <span class="secao-sub">${esc(estadoApp.usuario?.email || '')}</span>
      <button type="button" class="btn btn-sm" id="nav-btn-sair">Sair</button>
    `;
  }

  nav.querySelector('#nav-btn-notif')?.addEventListener('click', async () => {
    await registrarTokenNotificacao(EQUIPE_ID, estadoApp.usuario, estadoApp.papel);
    renderizarTopbar();
  });

  nav.querySelector('#nav-btn-sair')?.addEventListener('click', () => {
    signOut(auth);
  });
}

function observarSubcolecoesDaMissao(missaoId) {
  if (unsubsPorMissao.has(missaoId)) return;

  if (!estadoApp.subcolecoesMap[missaoId]) {
    estadoApp.subcolecoesMap[missaoId] = {
      alteracoes: [],
      respostas: [],
      revisoes: [],
      estado: null,
      registros: [],
      pendencias: [],
      entregas: [],
    };
  }

  const base = ['equipes', EQUIPE_ID, 'missoes', missaoId];
  const nomesCols = [
    'alteracoes',
    'respostas',
    'revisoes',
    'registros',
    'pendencias',
    'entregas',
    ...(estadoApp.papel === 'gestor' ? ['planos'] : []),
  ];
  const listaUnsubs = [];

  for (const nomeCol of nomesCols) {
    const u = onSnapshot(
      collection(db, ...base, nomeCol),
      (snap) => {
        estadoApp.subcolecoesMap[missaoId][nomeCol] = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        atualizarTela();
      },
      () => {}
    );
    listaUnsubs.push(u);
  }

  const uEstado = onSnapshot(
    doc(db, ...base, 'responsavel', 'estado'),
    (snap) => {
      estadoApp.subcolecoesMap[missaoId].estado = snap.exists() ? snap.data() : null;
      atualizarTela();
    },
    () => {}
  );
  listaUnsubs.push(uEstado);

  unsubsPorMissao.set(missaoId, listaUnsubs);
}

function iniciarModoGestor() {
  estadoApp.telaAtual = 'painel';

  const uEquipe = onSnapshot(doc(db, 'equipes', EQUIPE_ID), (snap) => {
    if (snap.exists()) {
      estadoApp.equipe = snap.data();
      atualizarTela();
    }
  });

  const uMembros = onSnapshot(collection(db, 'equipes', EQUIPE_ID, 'membros'), (snap) => {
    const mapa = {};
    snap.docs.forEach((d) => {
      mapa[d.id] = d.data();
    });
    estadoApp.membros = mapa;
    atualizarTela();
  });

  const uMissoes = onSnapshot(collection(db, 'equipes', EQUIPE_ID, 'missoes'), (snap) => {
    const mapa = {};
    snap.docs.forEach((d) => {
      mapa[d.id] = { id: d.id, ...d.data() };
      observarSubcolecoesDaMissao(d.id);
    });
    estadoApp.missoesMap = mapa;
    atualizarTela();
  });

  unsubsPrincipais.push(uEquipe, uMembros, uMissoes);

  if ('Notification' in window && Notification.permission === 'granted') {
    registrarTokenNotificacao(EQUIPE_ID, estadoApp.usuario, 'gestor').catch(() => {});
  }
}

function iniciarModoResponsavel(user) {
  const email = (user.email || '').toLowerCase();
  estadoApp.telaAtual = 'folha';

  const uEquipe = onSnapshot(doc(db, 'equipes', EQUIPE_ID), (snap) => {
    if (snap.exists()) {
      estadoApp.equipe = snap.data();
      atualizarTela();
    }
  });

  const qMissoes = query(
    collection(db, 'equipes', EQUIPE_ID, 'missoes'),
    where('responsavelEmail', '==', email),
    where('emitidaEm', '!=', null)
  );

  const uMissoes = onSnapshot(
    qMissoes,
    (snap) => {
      const mapa = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.emitidaEm) {
          mapa[d.id] = { id: d.id, ...data };
          observarSubcolecoesDaMissao(d.id);
        }
      });
      estadoApp.missoesMap = mapa;
      atualizarTela();
    },
    () => {
      atualizarTela();
    }
  );

  unsubsPrincipais.push(uEquipe, uMissoes);

  if ('Notification' in window && Notification.permission === 'granted') {
    registrarTokenNotificacao(EQUIPE_ID, estadoApp.usuario, 'responsavel').catch(() => {});
  }
}

function escolherMissaoDoResponsavel() {
  const lista = Object.values(estadoApp.missoesMap || {});
  if (lista.length === 0) return null;

  // Prioriza missão aberta (em execução, impedida, em ajuste, entregue) mais recente
  const comSituacao = lista
    .map((m) => {
      const subs = estadoApp.subcolecoesMap[m.id] || {};
      const { g, r } = montarObjetosAnalise(m, subs, estadoApp.membros);
      return { id: m.id, codigo: g.codigo, sit: situacao(g, r) };
    })
    .sort((a, b) => b.codigo.localeCompare(a.codigo));

  const aberta = comSituacao.find((x) => x.sit !== 'concluida' && x.sit !== 'cancelada');
  return (aberta || comSituacao[0]).id;
}

function atualizarTela() {
  renderizarTopbar();
  const root = document.getElementById('app-root');
  if (!root) return;

  // Não re-renderiza se o usuário estiver digitando ativamente num input/textarea dentro da folha/formulário
  const ativo = document.activeElement;
  if (
    ativo &&
    (ativo.tagName === 'INPUT' || ativo.tagName === 'TEXTAREA' || ativo.tagName === 'SELECT') &&
    root.contains(ativo) &&
    ativo.id !== 'inp-registro-data'
  ) {
    return;
  }

  if (estadoApp.papel === 'responsavel') {
    const missaoId = escolherMissaoDoResponsavel();
    if (!missaoId) {
      root.innerHTML = `
        <div class="container-folha" style="margin-top:28px;">
          <div class="card" style="text-align:center;padding:28px 16px;">
            <h2 class="secao-titulo">Nenhuma missão atribuída no momento</h2>
            <p class="secao-sub" style="margin-top:6px;">
              Quando o gestor emitir uma missão para <strong>${esc(estadoApp.usuario?.email)}</strong>, ela abrirá automaticamente aqui.
            </p>
          </div>
        </div>
      `;
      return;
    }
    renderizarTelaFolha(root, estadoApp, { missaoId });
    return;
  }

  if (estadoApp.papel === 'gestor') {
    if (estadoApp.telaAtual === 'equipe') {
      renderizarTelaEquipe(root, estadoApp);
    } else if (estadoApp.telaAtual === 'nova-missao') {
      renderizarTelaNovaMissao(root, estadoApp, {
        ...(estadoApp.opcoesEdicaoMissao || {}),
        aoConcluir: (idMissaoSalva) => {
          if (idMissaoSalva) {
            estadoApp.missaoAbertaId = idMissaoSalva;
            estadoApp.telaAtual = 'folha';
          } else {
            estadoApp.telaAtual = 'painel';
          }
          atualizarTela();
        },
      });
    } else if (estadoApp.telaAtual === 'folha' && estadoApp.missaoAbertaId) {
      renderizarTelaFolha(root, estadoApp, {
        missaoId: estadoApp.missaoAbertaId,
        aoVoltar: () => {
          estadoApp.telaAtual = 'painel';
          estadoApp.missaoAbertaId = null;
          atualizarTela();
        },
        aoAbrirEdicaoMissao: (opcoes) => {
          estadoApp.opcoesEdicaoMissao = opcoes;
          estadoApp.telaAtual = 'nova-missao';
          atualizarTela();
        },
      });
    } else {
      renderizarTelaPainel(root, estadoApp, {
        aoAbrirMissao: (missaoId) => {
          estadoApp.missaoAbertaId = missaoId;
          estadoApp.telaAtual = 'folha';
          atualizarTela();
        },
        aoNovaMissao: () => {
          estadoApp.opcoesEdicaoMissao = {};
          estadoApp.telaAtual = 'nova-missao';
          atualizarTela();
        },
      });
    }
  }
}
