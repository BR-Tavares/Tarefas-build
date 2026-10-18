// Tela Nova Missão / Editar Rascunho / Alterar Cabeçalho (Gestor)

import { esc, mostrarAviso } from './dom.js';
import { hojeSP, somaDiasUteis } from './feriados.js';
import { situacao } from './analise.js';
import { montarObjetosAnalise, ROTULO_VERIFICACAO } from './adaptador.js';
import { db, doc, setDoc, updateDoc, collection } from './firebase-config.js';

function linhasParaArray(texto) {
  return (texto || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function arrayParaLinhas(arr) {
  return (arr || []).join('\n');
}

export function renderizarTelaNovaMissao(root, estadoApp, opcoes = {}) {
  const { equipeId, equipe, usuario, membros, missoesMap, subcolecoesMap } = estadoApp;
  const { missaoExistente = null, pendenciaAlvo = null, aoConcluir } = opcoes;

  const ehAlteracao = Boolean(missaoExistente && missaoExistente.emitidaEm);
  const ehEdicaoRascunho = Boolean(missaoExistente && !missaoExistente.emitidaEm);

  const membrosAtivos = Object.values(membros || {}).filter((m) => m.ativo);

  // Encerramentos de missões anteriores para o gestor reler antes de emitir
  const encerramentos = Object.values(missoesMap || {})
    .map((m) => {
      const subs = subcolecoesMap[m.id] || {};
      const { g, r } = montarObjetosAnalise(m, subs, membros);
      return { g, r, sit: situacao(g, r) };
    })
    .filter((x) => x.sit === 'concluida' || x.g.fraseGestor || x.r.fraseResponsavel);

  const m = missaoExistente || {
    titulo: '',
    responsavelEmail: membrosAtivos[0]?.email || '',
    docsUrl: '',
    pastaUrl: '',
    dataEstimada: '',
    descricao: {
      necessidade: '',
      resultadoEsperado: '',
      tarefa: '',
      entrega: '',
      criterios: [{ condicao: '', verificacao: 'teste' }],
      insumos: '',
    },
    requisitos: {
      precisa: [],
      naoPode: [],
      consultarAntes: [],
    },
  };

  const criteriosIniciais =
    m.descricao?.criterios?.length > 0
      ? m.descricao.criterios.slice(0, 3)
      : [{ condicao: '', verificacao: 'teste' }];

  root.innerHTML = `
    <div class="container" style="max-width:680px;">
      ${
        encerramentos.length > 0 && !ehAlteracao
          ? `
        <div class="card" style="background:#F8FAFC;">
          <div class="secao-header">
            <h3 class="secao-titulo">Aprendizados de missões encerradas</h3>
            <span class="secao-sub">Releia antes de emitir uma missão parecida</span>
          </div>
          ${encerramentos
            .slice(-4)
            .reverse()
            .map(
              ({ g, r }) => `
              <div style="padding:6px 0;border-top:1px solid var(--border);font-size:12px;">
                <strong>${esc(g.codigo)} — ${esc(g.titulo)}</strong>
                ${
                  r.fraseResponsavel
                    ? `<div><span style="color:var(--muted);">O que faltou na folha (responsável):</span> ${esc(r.fraseResponsavel)}</div>`
                    : ''
                }
                ${
                  g.fraseGestor
                    ? `<div><span style="color:var(--blue);font-weight:600;">O que muda na próxima (gestor):</span> ${esc(g.fraseGestor)}</div>`
                    : ''
                }
              </div>
            `
            )
            .join('')}
        </div>
      `
          : ''
      }

      <div class="card">
        <div class="secao-header">
          <div>
            <h2 class="secao-titulo">
              ${
                ehAlteracao
                  ? `Alterar cabeçalho — ${esc(m.codigo)} (avança para v${(m.versao || 1) + 1})`
                  : ehEdicaoRascunho
                  ? `Editar rascunho — ${esc(m.codigo)}`
                  : 'Nova missão'
              }
            </h2>
            <div class="secao-sub">
              O gestor define o quê (descrição, critérios, requisitos e data estimada); o responsável define o como.
            </div>
          </div>
          ${
            !ehAlteracao && !ehEdicaoRascunho
              ? `<button type="button" id="btn-preencher-ms027" class="btn btn-sm btn-outline-azul">Carregar exemplo MS-027</button>`
              : ''
          }
        </div>

        ${
          membrosAtivos.length === 0
            ? `
          <div class="aviso-topo">
            <span>Cadastre pelo menos um responsável na tela <strong>Equipe</strong> antes de atribuir uma missão.</span>
          </div>
        `
            : ''
        }

        <form id="form-missao">
          ${
            ehAlteracao
              ? `
            <div class="campo-form">
              <label for="resumo-alteracao">Resumo da alteração (aparece para o responsável junto da nova versão)</label>
              <input id="resumo-alteracao" class="input" type="text" placeholder="Ex.: De acordo: o critério passa a 4 níveis × 3 rep." required />
            </div>
          `
              : ''
          }

          <div class="campo-form">
            <label for="mis-titulo">Título (verbo + objeto)</label>
            <input id="mis-titulo" class="input" type="text" value="${esc(m.titulo)}" placeholder="Ex.: Calibrar sensor de umidade em solo argiloso" required />
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div class="campo-form">
              <label for="mis-responsavel">Responsável único</label>
              <select id="mis-responsavel" class="select" required>
                <option value="">Selecione...</option>
                ${membrosAtivos
                  .map(
                    (p) => `
                  <option value="${esc(p.email)}" ${p.email === m.responsavelEmail ? 'selected' : ''}>
                    ${esc(p.nome)} (${esc(p.email)})
                  </option>
                `
                  )
                  .join('')}
              </select>
            </div>
            <div class="campo-form">
              <label for="mis-data">Data estimada (estimativa, não cobrança)</label>
              <input id="mis-data" class="input" type="date" value="${esc(m.dataEstimada)}" required />
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div class="campo-form">
              <label for="mis-docs">Link do Docs (opcional)</label>
              <input id="mis-docs" class="input" type="url" value="${esc(m.docsUrl || '')}" placeholder="https://docs.google.com/..." />
            </div>
            <div class="campo-form">
              <label for="mis-pasta">Link da Pasta no Drive (opcional)</label>
              <input id="mis-pasta" class="input" type="url" value="${esc(m.pastaUrl || '')}" placeholder="https://drive.google.com/..." />
            </div>
          </div>

          <hr class="divisor" />
          <h3 class="secao-titulo" style="margin-bottom:8px;">Descrição</h3>

          <div class="campo-form">
            <label for="mis-necessidade">Necessidade</label>
            <div class="ajuda">O que precisa ser resolvido, por que importa e que decisão depende disso.</div>
            <textarea id="mis-necessidade" class="textarea" required>${esc(m.descricao?.necessidade || '')}</textarea>
          </div>

          <div class="campo-form">
            <label for="mis-resultado">Resultado esperado</label>
            <div class="ajuda">Como fica a situação quando a missão termina bem.</div>
            <textarea id="mis-resultado" class="textarea" required>${esc(m.descricao?.resultadoEsperado || '')}</textarea>
          </div>

          <div class="campo-form">
            <label for="mis-tarefa">Tarefa</label>
            <div class="ajuda">O que fazer, em uma ou duas frases.</div>
            <textarea id="mis-tarefa" class="textarea" required>${esc(m.descricao?.tarefa || '')}</textarea>
          </div>

          <div class="campo-form">
            <label for="mis-entrega">Entrega</label>
            <div class="ajuda">O quê, em que formato e onde (padrão: na pasta da missão).</div>
            <input id="mis-entrega" class="input" type="text" value="${esc(m.descricao?.entrega || '')}" required />
          </div>

          <div class="campo-form">
            <label>Critérios de conclusão (até 3 linhas — se passar de 3, divida a missão)</label>
            <div class="ajuda">Formato: "[condição] — verificado por [inspeção / análise / demonstração / teste]"</div>
            <div id="lista-criterios" style="display:flex;flex-direction:column;gap:8px;margin-top:6px;">
              ${[0, 1, 2]
                .map((idx) => {
                  const c = criteriosIniciais[idx] || { condicao: '', verificacao: 'teste' };
                  return `
                    <div style="display:grid;grid-template-columns:1fr 150px;gap:6px;">
                      <input
                        class="input criterio-condicao"
                        type="text"
                        value="${esc(c.condicao)}"
                        placeholder="${idx === 0 ? 'Ex.: Erro médio ≤ 3 p.p. em 5 níveis × 3 repetições' : 'Critério adicional (opcional)'}"
                        ${idx === 0 ? 'required' : ''}
                      />
                      <select class="select criterio-verificacao">
                        ${Object.entries(ROTULO_VERIFICACAO)
                          .map(
                            ([val, rot]) => `
                          <option value="${val}" ${c.verificacao === val ? 'selected' : ''}>
                            verificado por ${rot}
                          </option>
                        `
                          )
                          .join('')}
                      </select>
                    </div>
                  `;
                })
                .join('')}
            </div>
          </div>

          <div class="campo-form">
            <label for="mis-insumos">Insumos</label>
            <div class="ajuda">O que já está disponível e onde.</div>
            <textarea id="mis-insumos" class="textarea">${esc(m.descricao?.insumos || '')}</textarea>
          </div>

          <hr class="divisor" />
          <h3 class="secao-titulo" style="margin-bottom:8px;">Requisitos da tarefa (limites globais à missão)</h3>

          <div class="campo-form">
            <label for="mis-precisa" style="color:var(--green);">PRECISA ACONTECER (Must — um por linha)</label>
            <textarea id="mis-precisa" class="textarea" placeholder="Ex.: Registrar todas as leituras, inclusive as descartadas, com o motivo.">${esc(arrayParaLinhas(m.requisitos?.precisa))}</textarea>
          </div>

          <div class="campo-form">
            <label for="mis-naopode" style="color:var(--red);">NÃO PODE ACONTECER (Must not — um por linha)</label>
            <textarea id="mis-naopode" class="textarea" placeholder="Ex.: Usar solo de outra classe textural.">${esc(arrayParaLinhas(m.requisitos?.naoPode))}</textarea>
          </div>

          <div class="campo-form">
            <label for="mis-consultar" style="color:var(--blue);">CONSULTAR ANTES (opcional — um por linha)</label>
            <textarea id="mis-consultar" class="textarea" placeholder="Ex.: Mudar o número de níveis ou de repetições.">${esc(arrayParaLinhas(m.requisitos?.consultarAntes))}</textarea>
          </div>

          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap;">
            <button type="button" id="btn-cancelar-form" class="btn">Voltar</button>
            ${
              ehAlteracao
                ? `<button type="submit" data-acao="alterar" class="btn btn-primario">Salvar alteração (v${(m.versao || 1) + 1})</button>`
                : `
                  <button type="submit" data-acao="rascunho" class="btn btn-outline-azul">Salvar rascunho</button>
                  <button type="submit" data-acao="emitir" class="btn btn-primario">Emitir missão</button>
                `
            }
          </div>
        </form>
      </div>
    </div>
  `;

  root.querySelector('#btn-cancelar-form')?.addEventListener('click', () => {
    if (aoConcluir) aoConcluir();
  });

  root.querySelector('#btn-preencher-ms027')?.addEventListener('click', () => {
    root.querySelector('#mis-titulo').value = 'Calibrar sensor de umidade em solo argiloso';
    root.querySelector('#mis-data').value = '2026-10-28';
    root.querySelector('#mis-docs').value = 'https://docs.google.com/document/d/exemplo-ms027';
    root.querySelector('#mis-pasta').value = 'https://drive.google.com/drive/folders/exemplo-ms027';
    root.querySelector('#mis-necessidade').value =
      'Saber se o sensor v2 mede bem em solo argiloso para ir ao piloto com agricultores.';
    root.querySelector('#mis-resultado').value =
      'A curva de calibração para solo argiloso, com erro conhecido.';
    root.querySelector('#mis-tarefa').value =
      'Comparar as leituras do sensor com o método gravimétrico em amostras de solo argiloso.';
    root.querySelector('#mis-entrega').value = 'Planilha e curva de calibração na pasta.';
    const condInputs = root.querySelectorAll('.criterio-condicao');
    const verSelects = root.querySelectorAll('.criterio-verificacao');
    condInputs[0].value = 'Erro médio ≤ 3 p.p. frente ao gravimétrico, em 5 níveis × 3 repetições';
    verSelects[0].value = 'teste';
    root.querySelector('#mis-insumos').value =
      'Sensor v2, amostras de solo argiloso, balança analítica e estufa no laboratório.';
    root.querySelector('#mis-precisa').value =
      'Registrar todas as leituras, inclusive as descartadas, com o motivo.';
    root.querySelector('#mis-naopode').value = 'Usar solo de outra classe textural.';
    root.querySelector('#mis-consultar').value = 'Mudar o número de níveis ou de repetições.';
  });

  let acaoClicada = ehAlteracao ? 'alterar' : 'emitir';
  root.querySelectorAll('button[type="submit"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      acaoClicada = btn.getAttribute('data-acao') || 'emitir';
    });
  });

  root.querySelector('#form-missao')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = root.querySelector('#mis-titulo').value.trim();
    const responsavelEmail = root.querySelector('#mis-responsavel').value.trim().toLowerCase();
    const dataEstimada = root.querySelector('#mis-data').value.trim();
    const docsUrl = root.querySelector('#mis-docs').value.trim();
    const pastaUrl = root.querySelector('#mis-pasta').value.trim();
    const necessidade = root.querySelector('#mis-necessidade').value.trim();
    const resultadoEsperado = root.querySelector('#mis-resultado').value.trim();
    const tarefa = root.querySelector('#mis-tarefa').value.trim();
    const entrega = root.querySelector('#mis-entrega').value.trim();
    const insumos = root.querySelector('#mis-insumos').value.trim();

    const condInputs = [...root.querySelectorAll('.criterio-condicao')];
    const verSelects = [...root.querySelectorAll('.criterio-verificacao')];
    const criterios = condInputs
      .map((inp, i) => ({
        condicao: inp.value.trim(),
        verificacao: verSelects[i].value,
      }))
      .filter((c) => c.condicao.length > 0);

    if (criterios.length === 0) {
      mostrarAviso('Informe pelo menos um critério de conclusão.', 'erro');
      return;
    }

    const precisa = linhasParaArray(root.querySelector('#mis-precisa').value);
    const naoPode = linhasParaArray(root.querySelector('#mis-naopode').value);
    const consultarAntes = linhasParaArray(root.querySelector('#mis-consultar').value);

    const hoje = hojeSP();
    const agoraIso = new Date().toISOString();

    try {
      if (ehAlteracao) {
        const resumo = root.querySelector('#resumo-alteracao').value.trim();
        const novaVersao = (m.versao || 1) + 1;

        // Identifica quais blocos mudaram para marcar "mudou na vN" na folha
        const mudaram = [];
        if (m.titulo !== titulo) mudaram.push('titulo');
        if (m.dataEstimada !== dataEstimada) mudaram.push('dataEstimada');
        if (m.responsavelEmail !== responsavelEmail) mudaram.push('responsavelEmail');
        if ((m.descricao?.necessidade || '') !== necessidade) mudaram.push('necessidade');
        if ((m.descricao?.resultadoEsperado || '') !== resultadoEsperado) mudaram.push('resultadoEsperado');
        if ((m.descricao?.tarefa || '') !== tarefa) mudaram.push('tarefa');
        if ((m.descricao?.entrega || '') !== entrega) mudaram.push('entrega');
        if (JSON.stringify(m.descricao?.criterios || []) !== JSON.stringify(criterios)) mudaram.push('criterios');
        if ((m.descricao?.insumos || '') !== insumos) mudaram.push('insumos');
        if (JSON.stringify(m.requisitos?.precisa || []) !== JSON.stringify(precisa)) mudaram.push('precisa');
        if (JSON.stringify(m.requisitos?.naoPode || []) !== JSON.stringify(naoPode)) mudaram.push('naoPode');
        if (JSON.stringify(m.requisitos?.consultarAntes || []) !== JSON.stringify(consultarAntes)) mudaram.push('consultarAntes');

        const missaoRef = doc(db, 'equipes', equipeId, 'missoes', m.id);
        await updateDoc(missaoRef, {
          titulo,
          responsavelEmail,
          dataEstimada,
          docsUrl,
          pastaUrl,
          linksEm: agoraIso,
          versao: novaVersao,
          camposMudaramUltimaVersao: mudaram,
          descricao: { necessidade, resultadoEsperado, tarefa, entrega, criterios, insumos },
          requisitos: { precisa, naoPode, consultarAntes },
        });

        const altRef = doc(collection(db, 'equipes', equipeId, 'missoes', m.id, 'alteracoes'));
        await setDoc(altRef, {
          versao: novaVersao,
          em: hoje,
          resumo,
          pendenciaId: pendenciaAlvo?.id || null,
        });

        if (pendenciaAlvo?.id) {
          await setDoc(
            doc(db, 'equipes', equipeId, 'missoes', m.id, 'respostas', pendenciaAlvo.id),
            {
              em: hoje,
              tipo: 'alteracao',
              texto: resumo,
            }
          );
        }

        mostrarAviso(`Missão atualizada para a versão ${novaVersao}.`, 'sucesso');
        if (aoConcluir) aoConcluir(m.id);
        return;
      }

      // Criação ou edição de rascunho / emissão
      let missaoId = m.id;
      let codigo = m.codigo;
      if (!missaoId) {
        const num = equipe?.proximoNumero || 1;
        codigo = `MS-${String(num).padStart(3, '0')}`;
        missaoId = codigo;
        await updateDoc(doc(db, 'equipes', equipeId), {
          proximoNumero: num + 1,
        });
      }

      const emitidaEm = acaoClicada === 'emitir' ? m.emitidaEm || hoje : null;
      await setDoc(doc(db, 'equipes', equipeId, 'missoes', missaoId), {
        codigo,
        titulo,
        gestorUid: usuario.uid,
        responsavelEmail,
        docsUrl,
        pastaUrl,
        linksEm: agoraIso,
        emitidaEm,
        dataEstimada,
        versao: 1,
        camposMudaramUltimaVersao: [],
        descricao: { necessidade, resultadoEsperado, tarefa, entrega, criterios, insumos },
        requisitos: { precisa, naoPode, consultarAntes },
        fraseGestor: '',
        cancelada: null,
        concluidaEm: null,
      });

      mostrarAviso(
        emitidaEm ? `Missão ${codigo} emitida!` : `Rascunho ${codigo} salvo.`,
        'sucesso'
      );
      if (aoConcluir) aoConcluir(missaoId);
    } catch (err) {
      mostrarAviso('Erro ao salvar missão: ' + err.message, 'erro');
    }
  });
}
