// Tela Equipe (exclusiva do gestor): incluir/desativar responsáveis e gerir feriados.

import { esc, mostrarAviso } from './dom.js';
import { FERIADOS_NACIONAIS_PADRAO, formatarDataCompleta } from './feriados.js';
import { db, doc, setDoc, updateDoc } from './firebase-config.js';

export function renderizarTelaEquipe(root, estadoApp) {
  const { equipeId, equipe, membros } = estadoApp;
  const listaMembros = Object.values(membros || {}).sort((a, b) =>
    (a.nome || '').localeCompare(b.nome || '')
  );
  const feriados = [...(equipe?.feriados || [])].sort();

  root.innerHTML = `
    <div class="container">
      <div class="card">
        <div class="secao-header">
          <div>
            <h2 class="secao-titulo">Equipe — ${esc(equipe?.nome || 'Principal')}</h2>
            <div class="secao-sub">Gestor: ${esc(equipe?.gestorEmail || '')}</div>
          </div>
        </div>
        <p class="texto-campo" style="color:var(--muted);">
          Quem tiver o e-mail ativo abaixo entra direto na sua missão atribuída ao acessar o link do app com a conta Google.
        </p>

        <hr class="divisor" />

        <h3 class="secao-titulo" style="margin-bottom:8px;">Incluir responsável na equipe</h3>
        <form id="form-incluir-membro" style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end;">
          <div class="campo-form" style="margin-bottom:0;">
            <label for="membro-nome">Nome</label>
            <input id="membro-nome" class="input" type="text" placeholder="Ex.: Marina Silva" required />
          </div>
          <div class="campo-form" style="margin-bottom:0;">
            <label for="membro-email">E-mail Google</label>
            <input id="membro-email" class="input" type="email" placeholder="marina@gmail.com" required />
          </div>
          <button type="submit" class="btn btn-primario">Incluir pessoa</button>
        </form>

        <div style="margin-top:16px;">
          <div class="rotulo-campo">Responsáveis cadastrados (${listaMembros.length})</div>
          ${
            listaMembros.length === 0
              ? `<p class="secao-sub" style="margin-top:6px;">Nenhum responsável cadastrado ainda.</p>`
              : listaMembros
                  .map(
                    (m) => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);gap:8px;">
                  <div>
                    <strong>${esc(m.nome)}</strong>
                    <span class="secao-sub" style="margin-left:6px;">${esc(m.email)}</span>
                    <span class="badge ${m.ativo ? 'badge-verde' : 'badge-neutro'}" style="margin-left:6px;">
                      ${m.ativo ? 'Ativo' : 'Desativado'}
                    </span>
                  </div>
                  <button
                    type="button"
                    class="btn btn-sm ${m.ativo ? 'btn-perigo' : 'btn-outline-azul'}"
                    data-toggle-membro="${esc(m.email)}"
                    data-novo-ativo="${m.ativo ? 'false' : 'true'}"
                  >
                    ${m.ativo ? 'Desativar' : 'Reativar'}
                  </button>
                </div>
              `
                  )
                  .join('')
          }
        </div>
      </div>

      <div class="card">
        <div class="secao-header">
          <div>
            <h2 class="secao-titulo">Feriados e dias sem expediente</h2>
            <div class="secao-sub">Feriados não contam como dia útil em analise.js (Critério 11)</div>
          </div>
          <button type="button" id="btn-restaurar-nacionais" class="btn btn-sm btn-outline-azul">
            Carregar nacionais 2026/2027
          </button>
        </div>

        <form id="form-adicionar-feriado" style="display:flex;gap:8px;align-items:end;margin-bottom:12px;flex-wrap:wrap;">
          <div class="campo-form" style="margin-bottom:0;">
            <label for="novo-feriado-data">Data (feriado local ou nacional)</label>
            <input id="novo-feriado-data" class="input" type="date" required />
          </div>
          <button type="submit" class="btn btn-primario">Adicionar feriado</button>
        </form>

        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${
            feriados.length === 0
              ? `<span class="secao-sub">Nenhum feriado cadastrado.</span>`
              : feriados
                  .map(
                    (f) => `
                <span class="badge badge-neutro" style="gap:6px;padding-right:6px;">
                  ${esc(formatarDataCompleta(f))}
                  <button
                    type="button"
                    data-remover-feriado="${esc(f)}"
                    style="background:none;border:none;color:var(--red);cursor:pointer;font-weight:700;padding:0 2px;"
                    title="Remover feriado"
                  >×</button>
                </span>
              `
                  )
                  .join('')
          }
        </div>
      </div>
    </div>
  `;

  const formMembro = root.querySelector('#form-incluir-membro');
  formMembro?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = root.querySelector('#membro-nome').value.trim();
    const email = root.querySelector('#membro-email').value.trim().toLowerCase();
    if (!nome || !email) return;
    try {
      await setDoc(doc(db, 'equipes', equipeId, 'membros', email), {
        nome,
        email,
        papel: 'responsavel',
        ativo: true,
      });
      mostrarAviso(`${nome} incluído(a) na equipe.`, 'sucesso');
      formMembro.reset();
    } catch (err) {
      mostrarAviso('Erro ao incluir pessoa: ' + err.message, 'erro');
    }
  });

  root.querySelectorAll('[data-toggle-membro]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const email = btn.getAttribute('data-toggle-membro');
      const ativo = btn.getAttribute('data-novo-ativo') === 'true';
      const atual = membros[email];
      if (!atual) return;
      try {
        await setDoc(doc(db, 'equipes', equipeId, 'membros', email), {
          ...atual,
          papel: 'responsavel',
          ativo,
        });
        mostrarAviso(ativo ? 'Pessoa reativada.' : 'Pessoa desativada.', 'sucesso');
      } catch (err) {
        mostrarAviso('Erro ao atualizar membro: ' + err.message, 'erro');
      }
    });
  });

  const formFeriado = root.querySelector('#form-adicionar-feriado');
  formFeriado?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = root.querySelector('#novo-feriado-data').value.trim();
    if (!data) return;
    const novoSet = Array.from(new Set([...feriados, data])).sort();
    try {
      await updateDoc(doc(db, 'equipes', equipeId), { feriados: novoSet });
      mostrarAviso(`Feriado ${formatarDataCompleta(data)} adicionado.`, 'sucesso');
    } catch (err) {
      mostrarAviso('Erro ao adicionar feriado: ' + err.message, 'erro');
    }
  });

  root.querySelectorAll('[data-remover-feriado]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const data = btn.getAttribute('data-remover-feriado');
      const novoSet = feriados.filter((x) => x !== data);
      try {
        await updateDoc(doc(db, 'equipes', equipeId), { feriados: novoSet });
        mostrarAviso('Feriado removido.', 'info');
      } catch (err) {
        mostrarAviso('Erro ao remover feriado: ' + err.message, 'erro');
      }
    });
  });

  root.querySelector('#btn-restaurar-nacionais')?.addEventListener('click', async () => {
    const novoSet = Array.from(new Set([...feriados, ...FERIADOS_NACIONAIS_PADRAO])).sort();
    try {
      await updateDoc(doc(db, 'equipes', equipeId), { feriados: novoSet });
      mostrarAviso('Feriados nacionais de 2026 e 2027 carregados.', 'sucesso');
    } catch (err) {
      mostrarAviso('Erro ao carregar feriados: ' + err.message, 'erro');
    }
  });
}
