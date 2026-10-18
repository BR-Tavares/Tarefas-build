// Tela Lista de Missões e Painel do Gestor em Tempo Real

import { esc } from './dom.js';
import { hojeSP, formatarDataCurta } from './feriados.js';
import { linhaPainel } from './analise.js';
import {
  montarObjetosAnalise,
  ROTULO_SITUACAO,
  ROTULO_SINAL,
} from './adaptador.js';

let filtroAba = 'abertas'; // 'abertas' | 'encerradas'

export function renderizarTelaPainel(root, estadoApp, opcoes = {}) {
  const { equipe, membros, missoesMap, subcolecoesMap } = estadoApp;
  const { aoAbrirMissao, aoNovaMissao } = opcoes;
  const feriados = equipe?.feriados || [];
  const hoje = hojeSP();

  const todasLinhas = Object.values(missoesMap || {})
    .map((m) => {
      const subs = subcolecoesMap[m.id] || {};
      const { g, r } = montarObjetosAnalise(m, subs, membros);
      const lp = linhaPainel(g, r, hoje, feriados);
      return { docId: m.id, codigo: g.codigo, lp, g, r };
    })
    .sort((a, b) => b.codigo.localeCompare(a.codigo));

  const abertas = todasLinhas.filter(
    (x) => x.lp.situacao !== 'concluida' && x.lp.situacao !== 'cancelada'
  );
  const encerradas = todasLinhas.filter(
    (x) => x.lp.situacao === 'concluida' || x.lp.situacao === 'cancelada'
  );

  // No topo: os sinais que notificam o gestor (notifica === true)
  const sinaisQueNotificam = [];
  for (const item of abertas) {
    for (const s of item.lp.sinais) {
      if (s.notifica) {
        sinaisQueNotificam.push({
          docId: item.docId,
          codigo: item.codigo,
          titulo: item.lp.titulo,
          responsavel: item.lp.responsavel,
          ...s,
        });
      }
    }
  }

  const listaExibida = filtroAba === 'abertas' ? abertas : encerradas;

  root.innerHTML = `
    <div class="container">
      ${
        sinaisQueNotificam.length > 0
          ? `
        <div class="card card-destaque-alerta">
          <div class="secao-header" style="margin-bottom:6px;">
            <h2 class="secao-titulo" style="color:var(--red);">
              Atenção do Gestor (${sinaisQueNotificam.length})
            </h2>
            <span class="secao-sub">Sinais que dependem de resposta ou revisão do gestor</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${sinaisQueNotificam
              .map(
                (sn) => `
              <div
                data-abrir-missao="${esc(sn.docId)}"
                style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;background:#fff;border:1px solid var(--border);border-radius:8px;cursor:pointer;flex-wrap:wrap;"
              >
                <div>
                  <strong>${esc(sn.codigo)} — ${esc(sn.titulo)}</strong>
                  <span class="secao-sub" style="margin-left:6px;">(${esc(sn.responsavel)})</span>
                </div>
                <span class="badge badge-vermelho">
                  ${esc(ROTULO_SINAL[sn.sinal] || sn.sinal)}: ${esc(sn.detalhe)}
                </span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
          : ''
      }

      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
        <div style="display:flex;gap:6px;">
          <button
            type="button"
            class="btn btn-sm ${filtroAba === 'abertas' ? 'btn-primario' : ''}"
            data-aba="abertas"
          >
            Missões abertas (${abertas.length})
          </button>
          <button
            type="button"
            class="btn btn-sm ${filtroAba === 'encerradas' ? 'btn-primario' : ''}"
            data-aba="encerradas"
          >
            Concluídas e canceladas (${encerradas.length})
          </button>
        </div>
        <button type="button" id="btn-painel-nova-missao" class="btn btn-sm btn-primario">
          + Nova missão
        </button>
      </div>

      ${
        listaExibida.length === 0
          ? `
        <div class="card" style="text-align:center;padding:32px 16px;">
          <p class="secao-sub" style="font-size:13px;">
            ${
              filtroAba === 'abertas'
                ? 'Nenhuma missão aberta no momento.'
                : 'Nenhuma missão concluída ou cancelada ainda.'
            }
          </p>
          ${
            filtroAba === 'abertas'
              ? `<button type="button" id="btn-vazio-nova-missao" class="btn btn-primario" style="margin-top:8px;">Criar primeira missão</button>`
              : ''
          }
        </div>
      `
          : `
        <div class="painel-grid">
          ${listaExibida
            .map(({ docId, codigo, lp, g, r }) => {
              const rotSit = ROTULO_SITUACAO[lp.situacao] || {
                texto: lp.situacao,
                classe: 'badge-neutro',
              };
              return `
                <div class="painel-linha" data-abrir-missao="${esc(docId)}">
                  <div>
                    <div class="meta-codigo">
                      <span>
                        <strong>${esc(codigo)}</strong> · v${lp.versao}
                        ${
                          lp.versaoNaoVista && lp.situacao !== 'rascunho'
                            ? `<span class="badge-mudou">não vista</span>`
                            : ''
                        }
                      </span>
                    </div>
                    <div style="font-weight:700;font-size:14.5px;margin-top:2px;">${esc(lp.titulo)}</div>
                    <div class="secao-sub" style="margin-top:2px;">Responsável: <strong>${esc(lp.responsavel)}</strong></div>
                  </div>

                  <div>
                    <span class="badge ${rotSit.classe}">${esc(rotSit.texto)}</span>
                    <div class="secao-sub" style="margin-top:4px;">
                      Data est.: <strong>${esc(formatarDataCurta(lp.dataEstimada))}</strong>
                      ${lp.diasSuspensos > 0 ? ` (+${lp.diasSuspensos}d imp.)` : ''}
                    </div>
                  </div>

                  <div>
                    <div style="font-size:12.5px;">Etapas: <strong>${esc(lp.etapas)}</strong></div>
                    <div class="secao-sub">
                      Últ. reg.: ${esc(formatarDataCurta(lp.ultimoRegistro))}
                    </div>
                  </div>

                  <div>
                    <div style="font-size:12.5px;">
                      ${
                        lp.atividadeAtual
                          ? `<strong>${esc(lp.atividadeAtual)}</strong> · ${lp.diasSeguidosNaAtividade} ${
                              lp.diasSeguidosNaAtividade === 1 ? 'dia seguido' : 'dias seguidos'
                            }`
                          : '<span class="secao-sub">Sem atividade registrada</span>'
                      }
                    </div>
                    ${
                      lp.diasOutraMissao > 0 || lp.diasForaDeMissao > 0
                        ? `<div class="secao-sub">${lp.diasOutraMissao}d outra missão · ${lp.diasForaDeMissao}d fora</div>`
                        : ''
                    }
                  </div>

                  <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end;">
                    ${
                      lp.sinais.length === 0
                        ? `<span class="secao-sub">Sem sinais</span>`
                        : lp.sinais
                            .map(
                              (s) => `
                          <span class="badge ${s.notifica ? 'badge-vermelho' : 'badge-amarelo'}">
                            ${esc(ROTULO_SINAL[s.sinal] || s.sinal)}: ${esc(s.detalhe)}
                          </span>
                        `
                            )
                            .join('')
                    }
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      `
      }
    </div>
  `;

  root.querySelectorAll('[data-aba]').forEach((btn) => {
    btn.addEventListener('click', () => {
      filtroAba = btn.getAttribute('data-aba');
      renderizarTelaPainel(root, estadoApp, opcoes);
    });
  });

  root.querySelector('#btn-painel-nova-missao')?.addEventListener('click', () => aoNovaMissao?.());
  root.querySelector('#btn-vazio-nova-missao')?.addEventListener('click', () => aoNovaMissao?.());

  root.querySelectorAll('[data-abrir-missao]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-abrir-missao');
      if (id) aoAbrirMissao?.(id);
    });
  });
}
