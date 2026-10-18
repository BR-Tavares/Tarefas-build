// Tela Folha da Missão — Responsável (5 blocos, fiel a tela_missao_funcionario.svg)
// e Folha Espelhada do Gestor (somente leitura nos blocos do responsável + Painel,
// Linha do Tempo, Responder/Alterar e Revisar).

import { esc, mostrarAviso } from './dom.js';
import {
  hojeSP,
  formatarDataCurta,
  formatarDiaRegistro,
} from './feriados.js';
import {
  situacao,
  dataExibida,
  sugerirAtividades,
  linhaPainel,
  linhaDoTempo,
} from './analise.js';
import {
  montarObjetosAnalise,
  obterLinksVigentes,
  ROTULO_SITUACAO,
  ROTULO_VERIFICACAO,
  ROTULO_MOTIVO,
  ROTULO_TIPO_PENDENCIA,
  ROTULO_BLOQUEIO,
  ROTULO_SINAL,
  ROTULO_PRODUTO,
} from './adaptador.js';
import {
  db,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
} from './firebase-config.js';
import { exemploDidatico } from './exemplo-didatico.js';
import { renderizarSeletorTemaHTML, conectarEventosSeletorTema } from './tema.js';

// Estado local de UI da folha (para não fechar modais/expanders ao receber snapshot)
const uiFolha = {
  missaoId: null,
  verMaisDescricao: false,
  editandoLinks: false,
  editandoEtapas: false,
  menuPendenciasAberto: false,
  abrindoPendencia: false,
  respondendoPendenciaId: null,
  preenchendoEntrega: false,
  planosHistoricoAberto: false,
  vendoExemploDidatico: false,
  diaSelecionado: null,
  mostrarAutocomplete: false,
  textoAtividade: '',
};

export function renderizarTelaFolha(root, estadoApp, opcoes = {}) {
  const {
    papel,
    equipeId,
    equipe,
    membros,
    missoesMap,
    subcolecoesMap,
  } = estadoApp;
  const { missaoId, aoVoltar, aoAbrirEdicaoMissao, somenteLeitura = false } = opcoes;

  const ehExemplo = uiFolha.vendoExemploDidatico || missaoId === 'MS-000';
  const missaoDoc = ehExemplo ? exemploDidatico.missaoDoc : missoesMap[missaoId];
  if (!missaoDoc) {
    root.innerHTML = `
      <div class="container-folha">
        <div class="card">
          <p class="secao-sub">Missão não encontrada.</p>
          ${papel === 'gestor' ? `<button class="btn" id="btn-voltar-lista">← Voltar</button>` : ''}
        </div>
      </div>
    `;
    root.querySelector('#btn-voltar-lista')?.addEventListener('click', () => aoVoltar?.());
    return;
  }

  const feriados = equipe?.feriados || [];
  const hoje = hojeSP();
  const subs = ehExemplo ? exemploDidatico.subcolecoes : (subcolecoesMap[missaoId] || {});
  const { g, r } = montarObjetosAnalise(missaoDoc, subs, membros);
  const sit = situacao(g, r);
  const rotSit = ROTULO_SITUACAO[sit] || { texto: sit, classe: 'badge-neutro' };
  const { data: dataEstExibida, diasSuspensos } = dataExibida(g, r, hoje, feriados);
  const links = obterLinksVigentes(g, r);
  const ultimaAlteracao = g.alteracoes.at(-1);
  const mudou = new Set(g.camposMudaramUltimaVersao || []);
  const badgeMudou = (campo) =>
    g.versao > 1 && mudou.has(campo)
      ? `<span class="badge-mudou">mudou na v${g.versao}</span>`
      : '';

  if (uiFolha.missaoId !== missaoId) {
    uiFolha.missaoId = missaoId;
    uiFolha.verMaisDescricao = false;
    uiFolha.editandoLinks = false;
    uiFolha.editandoEtapas = false;
    uiFolha.menuPendenciasAberto = false;
    uiFolha.abrindoPendencia = false;
    uiFolha.respondendoPendenciaId = null;
    uiFolha.preenchendoEntrega = false;
    uiFolha.planosHistoricoAberto = false;
    uiFolha.diaSelecionado = hoje;
    uiFolha.mostrarAutocomplete = false;
    const regHoje = r.registros.find((x) => x.dia === hoje);
    uiFolha.textoAtividade = regHoje
      ? regHoje.atividade || ROTULO_MOTIVO[regHoje.motivo] || ''
      : '';
  }

  const diaReg = uiFolha.diaSelecionado || hoje;
  const regDoDia = r.registros.find((x) => x.dia === diaReg);
  const abertaParaEscritaResp =
    !somenteLeitura && !ehExemplo && papel === 'responsavel' && sit !== 'concluida' && sit !== 'cancelada';

  // Critério 5: se o responsável abriu a folha e vistoVersao < g.versao, atualiza vistoVersao
  const versaoEraNaoVista = papel === 'responsavel' && g.versao > (r.vistoVersao || 0);
  if (versaoEraNaoVista && sit !== 'cancelada') {
    setDoc(
      doc(db, 'equipes', equipeId, 'missoes', missaoId, 'responsavel', 'estado'),
      {
        vistoVersao: g.versao,
        primeiroPlanoEm: r.primeiroPlanoEm || null,
        etapas: r.etapas || [],
        fraseResponsavel: r.fraseResponsavel || '',
      },
      { merge: true }
    ).catch(() => {});
  }

  // No primeiro acesso do responsável, pede as etapas antes de qualquer outra coisa (Seção 9.1)
  const pedirPrimeiroPlano =
    abertaParaEscritaResp && r.etapas.length === 0 && !r.primeiroPlanoEm;
  const mostrarEditorEtapas = pedirPrimeiroPlano || uiFolha.editandoEtapas;

  // Bloco exclusivo do gestor no topo da Folha Espelhada
  let htmlTopoGestor = '';
  if (papel === 'gestor') {
    const lp = linhaPainel(g, r, hoje, feriados);
    const tl = linhaDoTempo(r);
    htmlTopoGestor = `
      <div class="card" style="background:#F8FAFC;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
          <button type="button" id="btn-voltar-lista" class="btn btn-sm">← Lista de missões</button>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${
              sit === 'rascunho'
                ? `
                  <button type="button" id="btn-editar-rascunho" class="btn btn-sm btn-outline-azul">Editar rascunho</button>
                  <button type="button" id="btn-emitir-rascunho" class="btn btn-sm btn-primario">Emitir missão</button>
                  <button type="button" id="btn-apagar-rascunho" class="btn btn-sm btn-perigo">Apagar rascunho</button>
                `
                : ''
            }
            ${
              sit !== 'rascunho' && sit !== 'concluida' && sit !== 'cancelada'
                ? `
                  <button type="button" id="btn-alterar-cabecalho" class="btn btn-sm btn-outline-azul">Alterar cabeçalho (v${g.versao + 1})</button>
                  <button type="button" id="btn-cancelar-missao" class="btn btn-sm btn-perigo">Cancelar missão</button>
                `
                : ''
            }
          </div>
        </div>

        <div class="rotulo-campo" style="margin-top:0;">Painel do Gestor (exclusivo — responsável não vê)</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-top:6px;font-size:12.5px;">
          <div><span style="color:var(--muted);">Responsável:</span> <strong>${esc(lp.responsavel)}</strong></div>
          <div><span style="color:var(--muted);">Etapas:</span> <strong>${esc(lp.etapas)}</strong></div>
          <div><span style="color:var(--muted);">Último registro:</span> <strong>${esc(formatarDataCurta(lp.ultimoRegistro))}</strong></div>
          <div>
            <span style="color:var(--muted);">Atividade atual:</span>
            <strong>${lp.atividadeAtual ? `${esc(lp.atividadeAtual)} (${lp.diasSeguidosNaAtividade}d seguidos)` : '—'}</strong>
          </div>
          <div>
            <span style="color:var(--muted);">Fora/outra missão:</span>
            <strong>${lp.diasOutraMissao}d outra · ${lp.diasForaDeMissao}d fora</strong>
          </div>
          <div>
            <span style="color:var(--muted);">Versão v${lp.versao}:</span>
            <strong>${lp.versaoNaoVista ? '<span style="color:var(--amber);">Não vista pelo responsável</span>' : 'Vista'}</strong>
          </div>
        </div>

        ${
          lp.sinais.length > 0
            ? `
          <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
            ${lp.sinais
              .map(
                (s) => `
              <span class="badge ${s.notifica ? 'badge-vermelho' : 'badge-amarelo'}">
                ${esc(ROTULO_SINAL[s.sinal] || s.sinal)}: ${esc(s.detalhe)}
              </span>
            `
              )
              .join('')}
          </div>
          <details style="margin-top:10px;font-size:12px;color:var(--muted);">
            <summary style="cursor:pointer;font-weight:600;color:var(--blue);">
              Perguntas do Coaching Kata (para conversar diante do trabalho real)
            </summary>
            <ol style="margin:6px 0 0 18px;padding:0;color:var(--text);">
              <li>Qual é o resultado esperado?</li>
              <li>Onde estamos agora?</li>
              <li>O que está impedindo, e qual obstáculo você ataca agora?</li>
              <li>Qual é o próximo passo, e o que você espera que aconteça?</li>
              <li>Quando podemos ver juntos o que você aprendeu com esse passo?</li>
            </ol>
          </details>
        `
            : `<div style="margin-top:8px;font-size:12px;color:var(--green);font-weight:600;">Nenhum sinal ativo nesta missão.</div>`
        }

        <details style="margin-top:10px;">
          <summary class="link-acao">Linha do tempo dos registros (${tl.length} dias registrados) ▾</summary>
          <div style="margin-top:8px;">
            ${
              tl.length === 0
                ? `<div class="secao-sub">Nenhum registro diário ainda.</div>`
                : tl
                    .map(
                      (item) => `
                  <div class="timeline-item">
                    <span class="timeline-dia">${esc(formatarDiaRegistro(item.dia))}</span>
                    <span>${esc(item.texto)}</span>
                  </div>
                `
                    )
                    .join('')
            }
          </div>
        </details>
      </div>
    `;
  }

  const ultimaEntrega = r.entregas.at(-1);
  const ultimaRevisao =
    ultimaEntrega && g.revisoes.find((v) => v.entregaId === ultimaEntrega.id);

  root.innerHTML = `
    <div class="container-folha">
      <div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
        ${renderizarSeletorTemaHTML()}
      </div>

      ${htmlTopoGestor}

      ${
        versaoEraNaoVista || (papel === 'responsavel' && g.versao > 1 && ultimaAlteracao)
          ? `
        <div class="aviso-topo">
          <div>
            <strong>Versão ${g.versao}</strong>: ${esc(ultimaAlteracao?.resumo || 'Cabeçalho atualizado pelo gestor.')}
          </div>
        </div>
      `
          : ''
      }

      ${
        g.cancelada
          ? `
        <div class="card card-destaque-alerta">
          <div class="rotulo-campo rotulo-vermelho" style="margin-top:0;">Missão cancelada em ${esc(formatarDataCurta(g.cancelada.em))}</div>
          <p class="texto-campo">${esc(g.cancelada.motivo)}</p>
        </div>
      `
          : ''
      }

      ${
        ehExemplo
          ? `
        <div class="aviso-topo" style="background:#FEF3C7;border-color:#F59E0B;color:#92400E;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div><strong>Exemplo didático MS-000</strong> (somente leitura)</div>
            <div style="display:inline-flex;background:rgba(0,0,0,0.06);padding:2px;border-radius:6px;">
              <button type="button" id="btn-toggle-visao-resp" class="btn btn-sm ${papel === 'responsavel' ? 'btn-primario' : ''}" style="height:26px;font-size:11.5px;padding:0 8px;">
                Vista do Responsável
              </button>
              <button type="button" id="btn-toggle-visao-gest" class="btn btn-sm ${papel === 'gestor' ? 'btn-primario' : ''}" style="height:26px;font-size:11.5px;padding:0 8px;">
                Vista do Gestor
              </button>
            </div>
          </div>
          <button type="button" id="btn-fechar-exemplo" class="btn btn-sm btn-outline-azul">← Voltar</button>
        </div>
      `
          : ''
      }

      <!-- BLOCO 1: CABEÇALHO -->
      <section class="card">
        <div class="meta-codigo">
          <span>
            ${esc(g.codigo)} · versão ${g.emitidaEm ? (g.versao || 1) : 0}
            <button type="button" id="btn-abrir-exemplo" class="link-acao" style="margin-left:8px;font-size:11px;font-weight:normal;">
              ver um exemplo de folha
            </button>
          </span>
          ${
            !somenteLeitura && !ehExemplo
              ? `
            <button type="button" id="btn-toggle-links" class="link-acao" style="font-size:11px;">
              ${uiFolha.editandoLinks ? 'fechar links' : 'editar links'}
            </button>
          `
              : ''
          }
        </div>

        <h1 class="titulo-missao">
          ${esc(g.titulo)} ${badgeMudou('titulo')}
        </h1>

        <div class="pills-row" style="margin-bottom:0;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            ${
              links.docsUrl
                ? `<a class="pill-link" href="${esc(links.docsUrl)}" target="_blank" rel="noopener noreferrer">Docs ↗</a>`
                : !somenteLeitura && !ehExemplo
                ? `<button type="button" class="pill-link" id="btn-atalho-docs" style="opacity:0.7;cursor:pointer;">+ Docs ↗</button>`
                : ''
            }
            ${
              links.pastaUrl
                ? `<a class="pill-link" href="${esc(links.pastaUrl)}" target="_blank" rel="noopener noreferrer">Pasta ↗</a>`
                : !somenteLeitura && !ehExemplo
                ? `<button type="button" class="pill-link" id="btn-atalho-pasta" style="opacity:0.7;cursor:pointer;">+ Pasta ↗</button>`
                : ''
            }
          </div>
          <div>
            <span class="badge badge-neutro">
              Data estimada ${esc(formatarDataCurta(dataEstExibida))}${
                diasSuspensos > 0 ? ` (+${diasSuspensos} por impedimento)` : ''
              }
            </span>
            ${badgeMudou('dataEstimada')}
          </div>
        </div>

        ${
          uiFolha.editandoLinks && !somenteLeitura && !ehExemplo
            ? `
          <form id="form-editar-links" style="background:var(--bg);padding:10px;border-radius:8px;margin-top:10px;margin-bottom:10px;">
            <div class="campo-form" style="margin-bottom:8px;">
              <label for="inp-link-docs">Link do Google Docs</label>
              <input id="inp-link-docs" class="input" type="url" value="${esc(links.docsUrl)}" placeholder="https://docs.google.com/..." />
            </div>
            <div class="campo-form" style="margin-bottom:8px;">
              <label for="inp-link-pasta">Link da Pasta no Google Drive</label>
              <input id="inp-link-pasta" class="input" type="url" value="${esc(links.pastaUrl)}" placeholder="https://drive.google.com/..." />
            </div>
            <div style="display:flex;justify-content:flex-end;gap:6px;">
              <button type="submit" class="btn btn-sm btn-primario">Salvar links</button>
            </div>
          </form>
        `
            : ''
        }

        <hr class="divisor" />

        <div class="rotulo-campo">NECESSIDADE ${badgeMudou('necessidade')}</div>
        <p class="texto-campo">${esc(g.descricao.necessidade)}</p>

        <div class="rotulo-campo">TAREFA ${badgeMudou('tarefa')}</div>
        <p class="texto-campo">${esc(g.descricao.tarefa)}</p>

        <div style="margin-top:12px;">
          <div class="secao-titulo" style="font-size:13px;margin-bottom:2px;">Requisitos da tarefa</div>

          <div class="rotulo-campo rotulo-verde">PRECISA ACONTECER ${badgeMudou('precisa')}</div>
          <p class="texto-campo">${
            (g.requisitos.precisa || []).length > 0
              ? g.requisitos.precisa.map((x) => esc(x)).join('\n')
              : '—'
          }</p>

          <div class="rotulo-campo rotulo-vermelho">NÃO PODE ACONTECER ${badgeMudou('naoPode')}</div>
          <p class="texto-campo">${
            (g.requisitos.naoPode || []).length > 0
              ? g.requisitos.naoPode.map((x) => esc(x)).join('\n')
              : '—'
          }</p>
        </div>

        <div class="rotulo-campo" style="margin-top:10px;">FORMATO DA ENTREGA ${badgeMudou('entrega')}</div>
        <p class="texto-campo" style="margin-bottom:0;">${esc(g.descricao.entrega)}</p>
      </section>

      <!-- BLOCO 2: ETAPAS -->
      <section class="card ${pedirPrimeiroPlano ? 'card-destaque-azul' : ''}">
        <div class="secao-header">
          <div style="display:flex;align-items:baseline;gap:8px;">
            <h2 class="secao-titulo">Etapas</h2>
            <span class="secao-sub">
              escritas no início${r.primeiroPlanoEm ? ` · ${esc(formatarDataCurta(r.primeiroPlanoEm))}` : ''}
            </span>
          </div>
          ${
            abertaParaEscritaResp && !pedirPrimeiroPlano
              ? `<button type="button" id="btn-editar-etapas" class="link-acao">${mostrarEditorEtapas ? 'fechar' : 'editar'}</button>`
              : ''
          }
        </div>

        ${
          mostrarEditorEtapas && abertaParaEscritaResp
            ? `
          <form id="form-etapas">
            <div class="ajuda" style="margin-bottom:6px;color:var(--muted);font-size:12px;">
              Escreva poucas etapas, uma por linha, cada uma com um nome que diga o resultado (ex.: <em>Amostras preparadas</em>).
            </div>
            <textarea id="inp-etapas-linhas" class="textarea" rows="4" placeholder="Amostras preparadas&#10;Níveis 1 a 3 medidos&#10;Nível 4 medido&#10;Planilha consolidada" required>${esc(
              r.etapas.map((e) => e.nome).join('\n')
            )}</textarea>
            <div style="display:flex;justify-content:flex-end;gap:6px;margin-top:8px;">
              ${
                !pedirPrimeiroPlano
                  ? `<button type="button" id="btn-cancelar-etapas" class="btn btn-sm">Cancelar</button>`
                  : ''
              }
              <button type="submit" class="btn btn-sm btn-primario">Salvar etapas</button>
            </div>
          </form>
        `
            : r.etapas.length === 0
            ? `<p class="secao-sub">O responsável ainda não registrou as etapas iniciais.</p>`
            : `
          <div>
            ${r.etapas
              .map(
                (et, idx) => `
              <div class="etapa-item" data-toggle-etapa="${idx}">
                <span class="etapa-check ${et.concluidaEm ? 'concluida' : ''}">
                  ${
                    et.concluidaEm
                      ? `<svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6 l3 3 l5 -6" stroke="#fff" stroke-width="2" fill="none"/></svg>`
                      : ''
                  }
                </span>
                <span class="etapa-nome ${et.concluidaEm ? 'concluida' : ''}">${esc(et.nome)}</span>
              </div>
            `
              )
              .join('')}
          </div>
        `
        }

        ${
          papel === 'gestor' && (g.planos || []).length > 0
            ? `
          <div style="margin-top:12px;border-top:1px dashed var(--border);padding-top:8px;">
            <button type="button" id="btn-toggle-planos" class="link-acao" style="font-size:12px;">
              ${uiFolha.planosHistoricoAberto ? 'Ocultar planos anteriores ▴' : `Planos anteriores (${g.planos.length}) ▾`}
            </button>
            ${
              uiFolha.planosHistoricoAberto
                ? `
              <div style="margin-top:8px;">
                ${g.planos
                  .map((plano, i) => {
                    const anterior = i > 0 ? g.planos[i - 1].etapas || [] : [];
                    const atual = plano.etapas || [];
                    const entrou = atual.filter((x) => !anterior.includes(x));
                    const saiu = anterior.filter((x) => !atual.includes(x));
                    return `
                      <div class="plano-historico-item">
                        <div style="color:var(--muted);margin-bottom:2px;">
                          <strong>${esc(formatarDataCurta(plano.em))}</strong> · versão ${plano.versaoMissao || 1}
                        </div>
                        <div>${atual.map((e) => esc(e)).join(' → ')}</div>
                        ${
                          i > 0
                            ? `
                          <div style="color:var(--muted);font-size:11px;margin-top:2px;">
                            ${entrou.length > 0 ? `<span style="color:var(--green);">entrou: ${esc(entrou.join(', '))}</span> · ` : ''}
                            ${saiu.length > 0 ? `<span style="color:var(--red);">saiu: ${esc(saiu.join(', '))}</span>` : ''}
                            ${entrou.length === 0 && saiu.length === 0 ? 'reordenado' : ''}
                          </div>
                        `
                            : ''
                        }
                      </div>
                    `;
                  })
                  .join('')}
              </div>
            `
                : ''
            }
          </div>
        `
            : ''
        }
      </section>

      <!-- BLOCO 3: PENDÊNCIAS -->
      <section class="card">
        ${
          !uiFolha.menuPendenciasAberto
            ? `
          <div class="menu-pendencias-fechado" id="btn-toggle-menu-pend">
            <div style="display:flex;align-items:center;gap:8px;flex:1;overflow:hidden;">
              <h2 class="secao-titulo" style="margin:0;font-size:14px;">Pendências</h2>
              ${(() => {
                const abertas = r.pendencias.filter((p) => !p.fechadaEm);
                if (abertas.length === 0) {
                  return `<span class="secao-sub" style="font-size:12px;">(nenhuma aberta)</span>`;
                }
                const maisRecente = abertas.at(-1);
                const temResp = g.respostas.some((x) => x.pendenciaId === maisRecente.id);
                const rotTipo = ROTULO_TIPO_PENDENCIA[maisRecente.tipo] || maisRecente.tipo.toUpperCase();
                const textoCortado =
                  maisRecente.texto.length > 40
                    ? maisRecente.texto.slice(0, 40) + '…'
                    : maisRecente.texto;
                return `
                  <span class="badge ${maisRecente.tipo === 'impedimento' ? 'badge-vermelho' : 'badge-azul'}" style="font-size:11px;">
                    ${esc(rotTipo)}
                  </span>
                  <span style="font-size:12px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${esc(textoCortado)}
                  </span>
                  ${temResp ? `<span class="badge badge-neutro" style="font-size:10px;">respondida</span>` : ''}
                  ${abertas.length > 1 ? `<span class="secao-sub" style="font-size:11px;">+ ${abertas.length - 1} abertas</span>` : ''}
                `;
              })()}
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              ${
                abertaParaEscritaResp
                  ? `<button type="button" id="btn-atalho-abrir-pend" class="link-acao" style="font-size:12px;">+ abrir</button>`
                  : ''
              }
              <span class="link-acao" style="font-size:11px;">abrir ▾</span>
            </div>
          </div>
        `
            : `
          <div class="secao-header">
            <div style="display:flex;align-items:center;gap:8px;">
              <h2 class="secao-titulo">Pendências</h2>
              <button type="button" id="btn-recolher-menu-pend" class="link-acao" style="font-size:12px;">recolher ▴</button>
            </div>
            ${
              abertaParaEscritaResp
                ? `<button type="button" id="btn-abrir-pendencia" class="link-acao">${uiFolha.abrindoPendencia ? 'fechar' : '+ abrir'}</button>`
                : ''
            }
          </div>

          ${
            uiFolha.abrindoPendencia && abertaParaEscritaResp
              ? `
            <form id="form-nova-pendencia" style="background:var(--bg);padding:12px;border-radius:8px;margin-bottom:12px;">
              <div class="campo-form">
                <label for="pend-tipo">Tipo de pendência</label>
                <select id="pend-tipo" class="select" required>
                  <option value="impedimento">Impedimento (andon — algo impede ou requisito em risco)</option>
                  <option value="duvida">Dúvida (algo na folha não está claro)</option>
                  <option value="consulta">Consulta (decisão listada em "consultar antes")</option>
                  <option value="nova_data">Nova data (a data estimada mudou)</option>
                </select>
              </div>
              <div class="campo-form" id="grupo-pend-bloqueio">
                <label for="pend-bloqueio">Alcance do bloqueio</label>
                <select id="pend-bloqueio" class="select">
                  <option value="parte">Bloqueia só uma parte (o resto do trabalho segue)</option>
                  <option value="tudo">Bloqueia tudo (missão fica Impedida e data estimada avança)</option>
                </select>
              </div>
              <div class="campo-form">
                <label for="pend-texto">Descrição</label>
                <div class="ajuda" id="ajuda-pend-texto">
                  O que impede; se bloqueia tudo ou só uma parte; o que já foi tentado.
                </div>
                <textarea id="pend-texto" class="textarea" required></textarea>
              </div>
              <div style="display:flex;justify-content:flex-end;gap:6px;">
                <button type="button" id="btn-cancelar-pendencia" class="btn btn-sm">Cancelar</button>
                <button type="submit" class="btn btn-sm btn-primario">Registrar pendência</button>
              </div>
            </form>
          `
              : ''
          }

          ${(() => {
            if (r.pendencias.length === 0) {
              return `<p class="secao-sub" style="margin:0;">Nenhuma pendência aberta.</p>`;
            }
            // Ordenação do menu aberto: abertas primeiro (as respondidas antes das que esperam resposta), fechadas depois
            const abertas = r.pendencias.filter((p) => !p.fechadaEm);
            const fechadas = r.pendencias.filter((p) => p.fechadaEm);
            abertas.sort((a, b) => {
              const respA = g.respostas.some((x) => x.pendenciaId === a.id);
              const respB = g.respostas.some((x) => x.pendenciaId === b.id);
              if (respA && !respB) return -1;
              if (!respA && respB) return 1;
              return (b.abertaEm || '').localeCompare(a.abertaEm || '');
            });

            const listaOrdenada = [...abertas, ...fechadas];

            return listaOrdenada
              .map((p) => {
                const resp = g.respostas.find((x) => x.pendenciaId === p.id);
                const altAssociada = resp?.tipo === 'alteracao'
                  ? g.alteracoes.find((a) => a.pendenciaId === p.id)
                  : null;
                const versaoCriada = altAssociada?.versao || g.versao;
                const ehImpedimento = p.tipo === 'impedimento';
                const badgeClasse = p.fechadaEm
                  ? 'badge-neutro'
                  : ehImpedimento
                  ? 'badge-vermelho'
                  : 'badge-azul';
                const rotTipo = ROTULO_TIPO_PENDENCIA[p.tipo] || p.tipo.toUpperCase();
                const rotBloq =
                  ehImpedimento && p.bloqueio !== 'nenhum'
                    ? ` · ${ROTULO_BLOQUEIO[p.bloqueio] || p.bloqueio}`
                    : '';

                return `
                  <div class="pendencia-card">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;">
                      <span class="badge ${badgeClasse}">
                        ${esc(rotTipo)}${esc(rotBloq)}${p.fechadaEm ? ' · FECHADA' : ''}
                      </span>
                      <span class="secao-sub">aberta em ${esc(formatarDataCurta(p.abertaEm))}</span>
                    </div>
                    <p class="texto-campo" style="margin-top:6px;">${esc(p.texto)}</p>

                    ${
                      resp
                        ? `
                      <div class="resposta-box">
                        <div class="resposta-titulo">
                          Resposta do gestor · ${
                            resp.tipo === 'alteracao' ? `ALTERAÇÃO → v${versaoCriada}` : 'RESPOSTA'
                          }
                        </div>
                        <p class="texto-campo" style="margin:0;">${esc(resp.texto)}</p>
                      </div>
                    `
                        : ''
                    }

                    ${
                      !p.fechadaEm && abertaParaEscritaResp
                        ? `
                      <div class="pendencia-rodape" style="justify-content:flex-end;">
                        <button type="button" class="btn btn-sm btn-outline-azul" data-fechar-pendencia="${esc(p.id)}">
                          Fechar pendência
                        </button>
                      </div>
                    `
                        : ''
                    }

                    ${
                      !p.fechadaEm && papel === 'gestor' && !ehExemplo
                        ? `
                      <div style="margin-top:8px;">
                        ${
                          uiFolha.respondendoPendenciaId === p.id
                            ? `
                          <form class="form-responder-pendencia" data-pendencia-id="${esc(p.id)}" style="background:var(--bg);padding:10px;border-radius:8px;">
                            <div class="campo-form" style="margin-bottom:8px;">
                              <label>Resposta (esclarece sem mudar o cabeçalho)</label>
                              <textarea class="textarea inp-resposta-texto" rows="2" placeholder="Escreva o esclarecimento..." required>${esc(resp?.texto || '')}</textarea>
                            </div>
                            <div style="display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap;">
                              <button type="button" class="btn btn-sm btn-outline-azul" data-responder-com-alteracao="${esc(p.id)}">
                                Responder com Alteração (editar folha → v${g.versao + 1})
                              </button>
                              <div style="display:flex;gap:6px;">
                                <button type="button" class="btn btn-sm btn-fechar-form-resp">Cancelar</button>
                                <button type="submit" class="btn btn-sm btn-primario">Enviar resposta</button>
                              </div>
                            </div>
                          </form>
                        `
                            : `
                          <div style="display:flex;gap:6px;flex-wrap:wrap;">
                            <button type="button" class="btn btn-sm btn-outline-azul" data-abrir-form-resp="${esc(p.id)}">
                              ${resp ? 'Editar resposta' : 'Responder'}
                            </button>
                            <button type="button" class="btn btn-sm btn-primario" data-responder-com-alteracao="${esc(p.id)}">
                              Alterar folha (v${g.versao + 1})
                            </button>
                          </div>
                        `
                        }
                      </div>
                    `
                        : ''
                    }
                  </div>
                `;
              })
              .join('');
          })()}
        `
        }
      </section>

      <!-- BLOCO 4: ENTREGA E REVISÃO -->
      <section class="card">
        <div class="secao-header">
          <h2 class="secao-titulo">Entrega</h2>
          ${(() => {
            if (!abertaParaEscritaResp || ehExemplo) return '';
            if (!ultimaEntrega) {
              return `<button type="button" id="btn-preencher-entrega" class="btn btn-sm btn-primario">${uiFolha.preenchendoEntrega ? 'Fechar' : 'Preencher entrega'}</button>`;
            }
            if (!ultimaRevisao) {
              return `<button type="button" id="btn-preencher-entrega" class="btn btn-sm btn-outline-azul">${uiFolha.preenchendoEntrega ? 'Fechar' : 'Corrigir entrega'}</button>`;
            }
            const temCriterioNaoAceito =
              ultimaRevisao.resultado === 'em_ajuste' ||
              (ultimaRevisao.criterios || []).some((c) => c.aceito === false);
            if (temCriterioNaoAceito) {
              return `<button type="button" id="btn-preencher-entrega" class="btn btn-sm btn-primario">${uiFolha.preenchendoEntrega ? 'Fechar' : 'Atualizar entrega'}</button>`;
            }
            return '';
          })()}
        </div>

        ${
          ultimaEntrega
            ? `
          <div style="border-top:1px solid var(--border);padding-top:10px;margin-top:6px;">
            <div class="rotulo-campo" style="margin-top:0;">
              Entrega registrada em ${esc(formatarDataCurta(ultimaEntrega.em))}
            </div>
            ${
              ultimaEntrega.link
                ? `<p class="texto-campo" style="margin-bottom:6px;"><strong>Link:</strong> <a href="${esc(ultimaEntrega.link)}" target="_blank" rel="noopener noreferrer" class="link-acao">${esc(ultimaEntrega.link)} ↗</a></p>`
                : ''
            }
            ${
              ultimaEntrega.observacoes
                ? `<p class="texto-campo" style="margin-bottom:6px;"><span style="color:var(--muted);">Observações do responsável:</span> ${esc(ultimaEntrega.observacoes)}</p>`
                : ''
            }
            ${
              ultimaEntrega.resultado
                ? `<p class="texto-campo" style="color:var(--muted);font-size:12px;"><strong>Resultado (legado):</strong> ${esc(ultimaEntrega.resultado)}</p>`
                : ''
            }

            <!-- Checklist dos critérios de conclusão -->
            <div class="rotulo-campo" style="margin-top:8px;">Checklist dos critérios de conclusão</div>
            ${
              ultimaEntrega.criterios && ultimaEntrega.criterios.length > 0
                ? `
              <table class="checklist-tabela">
                <thead>
                  <tr>
                    <th>Critério</th>
                    <th style="width:110px;text-align:center;">Responsável</th>
                    <th style="width:140px;">Gestor</th>
                  </tr>
                </thead>
                <tbody>
                  ${ultimaEntrega.criterios
                    .map((item, i) => {
                      const critDef = (g.descricao.criterios || []).find((c, idx) => (c.id || `idx-${idx}`) === item.criterioId) || g.descricao.criterios?.[i];
                      const revCrit = (ultimaRevisao?.criterios || []).find((c, idx) => (c.criterioId || `idx-${idx}`) === item.criterioId) || ultimaRevisao?.criterios?.[i];
                      const foiAtendido = item.atendido === true || item.status === 'atendido';

                      return `
                        <tr>
                          <td>
                            <strong>${esc(item.condicao || critDef?.condicao || `Critério ${i + 1}`)}</strong>
                            <div style="font-size:11px;color:var(--muted);margin-top:2px;">
                              verificado por ${esc(ROTULO_VERIFICACAO[critDef?.verificacao] || critDef?.verificacao || 'inspeção')}
                            </div>
                            ${item.comprovacao ? `<div style="font-size:11.5px;margin-top:4px;color:var(--text);"><span style="color:var(--muted);">Comprovação:</span> ${esc(item.comprovacao)}</div>` : ''}
                          </td>
                          <td style="text-align:center;vertical-align:middle;">
                            <span class="etapa-check ${foiAtendido ? 'concluida' : ''}" style="margin:0 auto;cursor:default;">
                              ${
                                foiAtendido
                                  ? `<svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6 l3 3 l5 -6" stroke="#fff" stroke-width="2" fill="none"/></svg>`
                                  : ''
                              }
                            </span>
                          </td>
                          <td>
                            ${
                              revCrit
                                ? revCrit.aceito
                                  ? `<span style="color:var(--green);font-weight:600;">Aceito</span>${revCrit.falta ? ` <span style="font-size:11px;color:var(--muted);">("${esc(revCrit.falta)}")</span>` : ''}`
                                  : `<span style="color:var(--red);font-weight:600;">Não aceito</span><div style="font-size:11.5px;color:var(--red);margin-top:2px;">O que falta: ${esc(revCrit.falta || '—')}</div>`
                                : '<span style="color:var(--muted);">Aguardando</span>'
                            }
                          </td>
                        </tr>
                      `;
                    })
                    .join('')}
                </tbody>
              </table>
            `
                : (ultimaEntrega.evidencias || [])
                    .map((ev, i) => {
                      const crit = g.descricao.criterios?.[i];
                      return `
                        <p class="texto-campo" style="margin-bottom:4px;">
                          • <strong>${esc(crit?.condicao || `Critério ${i + 1}`)}:</strong>
                          [${esc(ev.status)}] — ${esc(ev.onde)}
                        </p>
                      `;
                    })
                    .join('')
            }

            ${
              ultimaRevisao
                ? `
              <div class="resposta-box" style="margin-top:10px;">
                <div style="font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:3px;">
                  <span>Revisão do gestor · ${esc(formatarDataCurta(ultimaRevisao.em))}</span>
                  <span class="badge ${ultimaRevisao.resultado === 'concluida' ? 'badge-verde' : 'badge-amarelo'}" style="height:20px;font-size:11px;">
                    ${ultimaRevisao.resultado === 'concluida' ? 'Missão Concluída' : 'Em Ajuste'}
                  </span>
                </div>
                <div style="font-size:12px;color:var(--text);">
                  <strong>Avaliação do trabalho:</strong> ${esc(ROTULO_PRODUTO[ultimaRevisao.produto] || ultimaRevisao.produto || 'Atende ao esperado')}
                </div>
              </div>
            `
                : `<div class="secao-sub" style="margin-top:8px;">Aguardando revisão do gestor.</div>`
            }
          </div>
        `
            : ''
        }

        ${
          uiFolha.preenchendoEntrega && abertaParaEscritaResp
            ? `
          <form id="form-entrega" style="background:var(--bg);padding:12px;border-radius:8px;margin-top:10px;">
            <div class="campo-form">
              <label for="ent-link">Link da entrega (obrigatório)</label>
              <input
                id="ent-link"
                class="input"
                type="url"
                required
                placeholder="https://docs.google.com/... ou link do arquivo na pasta"
                value="${esc(ultimaEntrega?.link || '')}"
              />
            </div>

            <div class="campo-form">
              <label for="ent-observacoes">Observações do responsável</label>
              <textarea id="ent-observacoes" class="textarea" rows="2" placeholder="Observações, ressalvas ou notas sobre o trabalho...">${esc(ultimaEntrega?.observacoes || '')}</textarea>
            </div>

            <div class="campo-form">
              <label>Checklist dos critérios de conclusão</label>
              ${(g.descricao.criterios || [])
                .map((c, idx) => {
                  const cId = c.id || `idx-${idx}`;
                  const itemAnt = (ultimaEntrega?.criterios || []).find((x) => x.criterioId === cId);
                  const revAnt = (ultimaRevisao?.criterios || []).find((x) => x.criterioId === cId);
                  const marcado = itemAnt ? (itemAnt.atendido === true || itemAnt.status === 'atendido') : false;

                  return `
                    <div class="checklist-card ${revAnt && revAnt.aceito === false ? 'falta-ajuste' : ''}">
                      <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin:0;">
                        <input
                          type="checkbox"
                          class="ent-chk-crit"
                          data-crit-id="${esc(cId)}"
                          style="margin-top:2px;width:17px;height:17px;accent-color:var(--green);cursor:pointer;"
                          ${marcado ? 'checked' : ''}
                        />
                        <div style="flex:1;">
                          <div style="font-size:12.5px;font-weight:600;">
                            ${esc(c.condicao)}
                            <span style="font-weight:normal;color:var(--muted);font-size:11px;">
                              — verificado por ${esc(ROTULO_VERIFICACAO[c.verificacao] || c.verificacao)}
                            </span>
                          </div>
                          ${
                            revAnt && revAnt.aceito === false
                              ? `<div style="color:var(--red);font-size:11.5px;margin-top:4px;"><strong>O que falta:</strong> ${esc(revAnt.falta)}</div>`
                              : ''
                          }
                          <div style="margin-top:6px;">
                            <input
                              class="input ent-comprovacao-crit"
                              data-crit-id="${esc(cId)}"
                              type="text"
                              style="font-size:12px;padding:4px 8px;"
                              placeholder="Onde está a comprovação (opcional)"
                              value="${esc(itemAnt?.comprovacao || '')}"
                            />
                          </div>
                        </div>
                      </label>
                    </div>
                  `;
                })
                .join('')}
            </div>

            <div style="display:flex;justify-content:flex-end;gap:6px;margin-top:8px;">
              <button type="button" id="btn-cancelar-entrega" class="btn btn-sm">Cancelar</button>
              <button type="submit" class="btn btn-sm btn-primario">
                ${!ultimaEntrega ? 'Registrar entrega' : !ultimaRevisao ? 'Salvar correção' : 'Salvar nova entrega'}
              </button>
            </div>
          </form>
        `
            : ''
        }

        ${
          papel === 'gestor' && ultimaEntrega && !ultimaRevisao && !ehExemplo
            ? `
          <form id="form-revisao-gestor" style="background:var(--bg);padding:12px;border-radius:8px;margin-top:12px;">
            <h3 class="secao-titulo" style="margin-bottom:8px;">Revisão do Gestor</h3>

            <div class="campo-form">
              <label>Avaliação por critério de conclusão</label>
              ${(g.descricao.criterios || [])
                .map((c, idx) => {
                  const cId = c.id || `idx-${idx}`;
                  const itemEnt = (ultimaEntrega.criterios || []).find((x) => x.criterioId === cId);
                  const marcadoResp = itemEnt ? (itemEnt.atendido === true || itemEnt.status === 'atendido') : false;
                  return `
                    <div class="checklist-card">
                      <div style="font-size:12.5px;font-weight:600;margin-bottom:4px;">
                        ${esc(c.condicao)}
                        <span style="font-weight:normal;color:var(--muted);font-size:11px;">
                          — verificado por ${esc(ROTULO_VERIFICACAO[c.verificacao] || c.verificacao)}
                        </span>
                      </div>
                      ${
                        itemEnt
                          ? `<div style="font-size:12px;color:var(--text);margin-bottom:6px;">
                              Marca do responsável: <strong>${marcadoResp ? 'Atendido [✓]' : 'Não marcado [ ]'}</strong>
                              ${itemEnt.comprovacao ? ` · <span style="color:var(--muted);">Comprovação:</span> ${esc(itemEnt.comprovacao)}` : ''}
                            </div>`
                          : ''
                      }
                      <div style="display:grid;grid-template-columns:130px 1fr;gap:8px;">
                        <select class="select rev-aceito-crit" data-crit-id="${esc(cId)}" required>
                          <option value="true">Aceito</option>
                          <option value="false">Não aceito</option>
                        </select>
                        <input
                          class="input rev-falta-crit"
                          data-crit-id="${esc(cId)}"
                          type="text"
                          placeholder="O que falta (obrigatório se não aceito)"
                        />
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>

            <div class="campo-form" style="margin-top:8px;">
              <label for="rev-produto">Avaliação geral da entrega</label>
              <select id="rev-produto" class="select" required>
                <option value="atende">Atende ao esperado</option>
                <option value="nao_atende">Não atende aos requisitos</option>
                <option value="inconclusivo">Inconclusivo / precisa rever</option>
              </select>
            </div>

            <div style="display:flex;justify-content:flex-end;margin-top:8px;">
              <button type="submit" class="btn btn-sm btn-primario">Salvar revisão</button>
            </div>
          </form>
        `
            : ''
        }
      </section>

      <!-- BLOCO 5: FOCO DE HOJE (exclusivo para o responsável — 1 linha, sem histórico, sem contagem e sem alerta) -->
      ${
        abertaParaEscritaResp
          ? `
        <section class="card card-destaque-azul">
          <div class="secao-header" style="margin-bottom:4px;">
            <h2 class="secao-titulo">Foco de hoje</h2>
          </div>
          <div class="ajuda" style="margin-bottom:8px;font-size:12px;color:var(--muted);">
            Em que você focou hoje? Só o nome da atividade.
          </div>

          <form id="form-registro-dia" autocomplete="off">
            <div class="registro-linha">
              <div class="btn-data-registro" title="Toque para escolher outra data">
                <span>${esc(formatarDiaRegistro(diaReg))}</span>
                <span style="font-size:10px;color:var(--muted);">▾</span>
                <input id="inp-registro-data" class="input-data-oculto" type="date" value="${esc(diaReg)}" max="${esc(hoje)}" />
              </div>

              <input
                id="inp-registro-atividade"
                class="input-atividade-registro"
                type="text"
                maxlength="80"
                placeholder="Nome da atividade..."
                value="${esc(uiFolha.textoAtividade)}"
              />

              <button
                type="submit"
                id="btn-salvar-registro"
                class="btn-check-registro ${regDoDia ? 'gravado' : ''}"
                title="Registrar atividade do dia"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M4 9 l4 4 l7 -8" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

            <div id="box-autocomplete" class="autocomplete-box" style="${uiFolha.mostrarAutocomplete ? '' : 'display:none;'}"></div>
          </form>
        </section>
      `
          : ''
      }
    </div>
  `;

  configurarEventosFolha(root, estadoApp, { missaoId, g, r, sit, hoje, aoVoltar, aoAbrirEdicaoMissao });
}

function configurarEventosFolha(root, estadoApp, ctx) {
  const { papel, equipeId } = estadoApp;
  const { missaoId, g, r, sit, hoje, aoVoltar, aoAbrirEdicaoMissao } = ctx;

  conectarEventosSeletorTema(root);

  root.querySelector('#btn-voltar-lista')?.addEventListener('click', () => aoVoltar?.());

  const abrirLinks = () => {
    uiFolha.editandoLinks = !uiFolha.editandoLinks;
    renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao });
  };
  root.querySelector('#btn-toggle-links')?.addEventListener('click', abrirLinks);
  root.querySelector('#btn-atalho-docs')?.addEventListener('click', abrirLinks);
  root.querySelector('#btn-atalho-pasta')?.addEventListener('click', abrirLinks);

  root.querySelector('#form-editar-links')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const docsUrl = root.querySelector('#inp-link-docs').value.trim();
    const pastaUrl = root.querySelector('#inp-link-pasta').value.trim();
    const linksEm = new Date().toISOString();
    try {
      if (papel === 'gestor') {
        await updateDoc(doc(db, 'equipes', equipeId, 'missoes', missaoId), {
          docsUrl,
          pastaUrl,
          linksEm,
        });
      } else {
        await setDoc(
          doc(db, 'equipes', equipeId, 'missoes', missaoId, 'responsavel', 'estado'),
          {
            vistoVersao: r.vistoVersao || g.versao,
            primeiroPlanoEm: r.primeiroPlanoEm || null,
            etapas: r.etapas || [],
            fraseResponsavel: r.fraseResponsavel || '',
            docsUrl,
            pastaUrl,
            linksEm,
          },
          { merge: true }
        );
      }
      uiFolha.editandoLinks = false;
      mostrarAviso('Links atualizados.', 'sucesso');
    } catch (err) {
      mostrarAviso('Erro ao salvar links: ' + err.message, 'erro');
    }
  });

  // Ações de cabeçalho do gestor
  root.querySelector('#btn-editar-rascunho')?.addEventListener('click', () => {
    aoAbrirEdicaoMissao?.({ missaoExistente: { ...g, id: missaoId } });
  });

  root.querySelector('#btn-emitir-rascunho')?.addEventListener('click', async () => {
    try {
      await updateDoc(doc(db, 'equipes', equipeId, 'missoes', missaoId), {
        emitidaEm: hoje,
        versao: 1,
      });
      mostrarAviso(`Missão ${g.codigo} emitida!`, 'sucesso');
    } catch (err) {
      mostrarAviso('Erro ao emitir: ' + err.message, 'erro');
    }
  });

  root.querySelector('#btn-apagar-rascunho')?.addEventListener('click', async () => {
    if (!confirm(`Apagar o rascunho ${g.codigo}?`)) return;
    try {
      await deleteDoc(doc(db, 'equipes', equipeId, 'missoes', missaoId));
      mostrarAviso('Rascunho apagado.', 'info');
      aoVoltar?.();
    } catch (err) {
      mostrarAviso('Erro ao apagar rascunho: ' + err.message, 'erro');
    }
  });

  root.querySelector('#btn-alterar-cabecalho')?.addEventListener('click', () => {
    aoAbrirEdicaoMissao?.({ missaoExistente: { ...g, id: missaoId } });
  });

  root.querySelector('#btn-cancelar-missao')?.addEventListener('click', async () => {
    const motivo = prompt('Informe o motivo do cancelamento da missão:');
    if (!motivo || !motivo.trim()) return;
    try {
      await updateDoc(doc(db, 'equipes', equipeId, 'missoes', missaoId), {
        cancelada: { em: hoje, motivo: motivo.trim() },
      });
      mostrarAviso('Missão cancelada.', 'info');
    } catch (err) {
      mostrarAviso('Erro ao cancelar missão: ' + err.message, 'erro');
    }
  });

  // Exemplo didático (toggle)
  root.querySelector('#btn-abrir-exemplo')?.addEventListener('click', () => {
    uiFolha.vendoExemploDidatico = true;
    renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao, somenteLeitura: true });
  });

  root.querySelector('#btn-toggle-visao-resp')?.addEventListener('click', () => {
    renderizarTelaFolha(root, { ...estadoApp, papel: 'responsavel' }, { missaoId, aoVoltar, aoAbrirEdicaoMissao, somenteLeitura: true });
  });

  root.querySelector('#btn-toggle-visao-gest')?.addEventListener('click', () => {
    renderizarTelaFolha(root, { ...estadoApp, papel: 'gestor' }, { missaoId, aoVoltar, aoAbrirEdicaoMissao, somenteLeitura: true });
  });

  root.querySelector('#btn-fechar-exemplo')?.addEventListener('click', () => {
    uiFolha.vendoExemploDidatico = false;
    if (aoVoltar) {
      aoVoltar();
    } else {
      renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao, somenteLeitura: false });
    }
  });

  // Etapas (responsável)
  root.querySelector('#btn-editar-etapas')?.addEventListener('click', () => {
    uiFolha.editandoEtapas = !uiFolha.editandoEtapas;
    renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao });
  });
  root.querySelector('#btn-cancelar-etapas')?.addEventListener('click', () => {
    uiFolha.editandoEtapas = false;
    renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao });
  });

  // Histórico de planos (gestor)
  root.querySelector('#btn-toggle-planos')?.addEventListener('click', () => {
    uiFolha.planosHistoricoAberto = !uiFolha.planosHistoricoAberto;
    renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao });
  });

  root.querySelector('#form-etapas')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const linhas = root
      .querySelector('#inp-etapas-linhas')
      .value.split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (linhas.length === 0) return;

    const nomesAntigos = (r.etapas || []).map((x) => x.nome);
    const mudouNomes =
      linhas.length !== nomesAntigos.length ||
      linhas.some((nome, i) => nome !== nomesAntigos[i]);

    const novasEtapas = linhas.map((nome, i) => {
      const anterior = r.etapas.find((x) => x.nome.toLowerCase() === nome.toLowerCase());
      return {
        id: anterior?.id || `et-${i + 1}-${Date.now()}`,
        ordem: i + 1,
        nome,
        concluidaEm: anterior?.concluidaEm || null,
      };
    });

    try {
      await setDoc(
        doc(db, 'equipes', equipeId, 'missoes', missaoId, 'responsavel', 'estado'),
        {
          vistoVersao: g.versao,
          primeiroPlanoEm: r.primeiroPlanoEm || hoje,
          etapas: novasEtapas,
          fraseResponsavel: r.fraseResponsavel || '',
        },
        { merge: true }
      );

      // Critério A3: Salvar etapas com nomes diferentes grava documento em planos
      if (mudouNomes) {
        const planoRef = doc(collection(db, 'equipes', equipeId, 'missoes', missaoId, 'planos'));
        await setDoc(planoRef, {
          em: hoje,
          versaoMissao: g.versao || 1,
          etapas: linhas,
        });
      }

      uiFolha.editandoEtapas = false;
      mostrarAviso('Etapas salvas.', 'sucesso');
    } catch (err) {
      mostrarAviso('Erro ao salvar etapas: ' + err.message, 'erro');
    }
  });

  root.querySelectorAll('[data-toggle-etapa]').forEach((el) => {
    el.addEventListener('click', async () => {
      if (papel !== 'responsavel' || sit === 'concluida' || sit === 'cancelada') return;
      const idx = Number(el.getAttribute('data-toggle-etapa'));
      const etapasCopia = r.etapas.map((et, i) =>
        i === idx ? { ...et, concluidaEm: et.concluidaEm ? null : hoje } : et
      );
      try {
        await setDoc(
          doc(db, 'equipes', equipeId, 'missoes', missaoId, 'responsavel', 'estado'),
          {
            vistoVersao: g.versao,
            primeiroPlanoEm: r.primeiroPlanoEm || hoje,
            etapas: etapasCopia,
            fraseResponsavel: r.fraseResponsavel || '',
          },
          { merge: true }
        );
      } catch (err) {
        mostrarAviso('Erro ao atualizar etapa: ' + err.message, 'erro');
      }
    });
  });

  // Pendências (Menu suspenso v1.1)
  root.querySelector('#btn-toggle-menu-pend')?.addEventListener('click', (e) => {
    if (e.target.closest('#btn-atalho-abrir-pend')) return;
    uiFolha.menuPendenciasAberto = true;
    renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao });
  });
  root.querySelector('#btn-recolher-menu-pend')?.addEventListener('click', () => {
    uiFolha.menuPendenciasAberto = false;
    uiFolha.abrindoPendencia = false;
    renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao });
  });

  const abrirNovaPendencia = () => {
    uiFolha.menuPendenciasAberto = true;
    uiFolha.abrindoPendencia = !uiFolha.abrindoPendencia;
    renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao });
  };
  root.querySelector('#btn-atalho-abrir-pend')?.addEventListener('click', abrirNovaPendencia);
  root.querySelector('#btn-abrir-pendencia')?.addEventListener('click', abrirNovaPendencia);
  root.querySelector('#btn-cancelar-pendencia')?.addEventListener('click', () => {
    uiFolha.abrindoPendencia = false;
    renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao });
  });

  const selTipoPend = root.querySelector('#pend-tipo');
  selTipoPend?.addEventListener('change', () => {
    const t = selTipoPend.value;
    const grpBloq = root.querySelector('#grupo-pend-bloqueio');
    const ajuda = root.querySelector('#ajuda-pend-texto');
    if (grpBloq) grpBloq.style.display = t === 'impedimento' ? '' : 'none';
    if (ajuda) {
      const textos = {
        impedimento: 'O que impede; se bloqueia tudo ou só uma parte; o que já foi tentado.',
        duvida: 'A pergunta e o item da folha que não está claro.',
        consulta: 'Escreva: "Pretendo [ação], porque [motivo]."',
        nova_data: 'Informe o motivo e a nova data estimada.',
      };
      ajuda.textContent = textos[t] || '';
    }
  });

  root.querySelector('#form-nova-pendencia')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tipo = root.querySelector('#pend-tipo').value;
    const bloqueio =
      tipo === 'impedimento' ? root.querySelector('#pend-bloqueio').value : 'nenhum';
    const texto = root.querySelector('#pend-texto').value.trim();
    if (!texto) return;

    try {
      const pRef = doc(collection(db, 'equipes', equipeId, 'missoes', missaoId, 'pendencias'));
      await setDoc(pRef, {
        tipo,
        bloqueio,
        texto,
        abertaEm: hoje,
        fechadaEm: null,
      });
      uiFolha.abrindoPendencia = false;
      mostrarAviso('Pendência aberta.', 'sucesso');
    } catch (err) {
      mostrarAviso('Erro ao abrir pendência: ' + err.message, 'erro');
    }
  });

  root.querySelectorAll('[data-fechar-pendencia]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const pId = btn.getAttribute('data-fechar-pendencia');
      try {
        await updateDoc(doc(db, 'equipes', equipeId, 'missoes', missaoId, 'pendencias', pId), {
          fechadaEm: hoje,
        });
        mostrarAviso('Pendência fechada.', 'sucesso');
      } catch (err) {
        mostrarAviso('Erro ao fechar pendência: ' + err.message, 'erro');
      }
    });
  });

  // Resposta do gestor à pendência
  root.querySelectorAll('[data-abrir-form-resp]').forEach((btn) => {
    btn.addEventListener('click', () => {
      uiFolha.respondendoPendenciaId = btn.getAttribute('data-abrir-form-resp');
      renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao });
    });
  });
  root.querySelectorAll('.btn-fechar-form-resp').forEach((btn) => {
    btn.addEventListener('click', () => {
      uiFolha.respondendoPendenciaId = null;
      renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao });
    });
  });
  root.querySelectorAll('[data-responder-com-alteracao]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pId = btn.getAttribute('data-responder-com-alteracao');
      const pend = r.pendencias.find((x) => x.id === pId);
      aoAbrirEdicaoMissao?.({
        missaoExistente: { ...g, id: missaoId },
        pendenciaAlvo: pend,
      });
    });
  });

  root.querySelectorAll('.form-responder-pendencia').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pId = form.getAttribute('data-pendencia-id');
      const texto = form.querySelector('.inp-resposta-texto').value.trim();
      if (!texto) return;
      try {
        await setDoc(doc(db, 'equipes', equipeId, 'missoes', missaoId, 'respostas', pId), {
          em: hoje,
          tipo: 'resposta',
          texto,
        });
        uiFolha.respondendoPendenciaId = null;
        mostrarAviso('Resposta registrada.', 'sucesso');
      } catch (err) {
        mostrarAviso('Erro ao responder: ' + err.message, 'erro');
      }
    });
  });

  // Entrega e Revisão (v1.1)
  root.querySelector('#btn-preencher-entrega')?.addEventListener('click', () => {
    uiFolha.preenchendoEntrega = !uiFolha.preenchendoEntrega;
    renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao });
  });
  root.querySelector('#btn-cancelar-entrega')?.addEventListener('click', () => {
    uiFolha.preenchendoEntrega = false;
    renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao });
  });

  root.querySelector('#form-entrega')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const link = root.querySelector('#ent-link').value.trim();
    if (!link) {
      mostrarAviso('O link da entrega é obrigatório.', 'erro');
      return;
    }

    const observacoes = (root.querySelector('#ent-observacoes')?.value || '').trim();

    const criterios = (g.descricao.criterios || []).map((c, idx) => {
      const cId = c.id || `idx-${idx}`;
      const atendido = root.querySelector(`.ent-chk-crit[data-crit-id="${cId}"]`)?.checked || false;
      const comprovacao = (root.querySelector(`.ent-comprovacao-crit[data-crit-id="${cId}"]`)?.value || '').trim();

      return {
        criterioId: cId,
        condicao: c.condicao,
        atendido,
        comprovacao,
      };
    });

    try {
      const ultimaEntrega = r.entregas.at(-1);
      const ultimaRevisao = ultimaEntrega && g.revisoes.find((v) => v.entregaId === ultimaEntrega.id);

      // A9: Se a entrega ainda não tem revisão, "Corrigir entrega" edita o mesmo documento
      if (ultimaEntrega && !ultimaRevisao) {
        await updateDoc(doc(db, 'equipes', equipeId, 'missoes', missaoId, 'entregas', ultimaEntrega.id), {
          link,
          observacoes,
          criterios,
          corrigidaEm: hoje,
        });
        mostrarAviso('Entrega corrigida!', 'sucesso');
      } else {
        // Primeira entrega ou nova entrega pós-revisão com ajuste
        const entRef = doc(collection(db, 'equipes', equipeId, 'missoes', missaoId, 'entregas'));
        await setDoc(entRef, {
          em: hoje,
          link,
          observacoes,
          criterios,
        });
        mostrarAviso('Entrega registrada!', 'sucesso');
      }

      uiFolha.preenchendoEntrega = false;
    } catch (err) {
      mostrarAviso('Erro ao salvar entrega: ' + err.message, 'erro');
    }
  });

  root.querySelector('#form-revisao-gestor')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ultimaEntrega = r.entregas.at(-1);
    if (!ultimaEntrega) return;

    const criterios = (g.descricao.criterios || []).map((c, idx) => {
      const cId = c.id || `idx-${idx}`;
      const aceitoVal = root.querySelector(`.rev-aceito-crit[data-crit-id="${cId}"]`)?.value === 'true';
      const falta = (root.querySelector(`.rev-falta-crit[data-crit-id="${cId}"]`)?.value || '').trim();
      return {
        criterioId: cId,
        aceito: aceitoVal,
        falta,
      };
    });

    // Validação: não aceito exige "o que falta"
    for (const item of criterios) {
      if (!item.aceito && !item.falta) {
        mostrarAviso('Para critérios não aceitos, descreva o que falta.', 'erro');
        return;
      }
    }

    const todosAceitos = criterios.every((c) => c.aceito);
    const resultado = todosAceitos ? 'concluida' : 'em_ajuste';
    const produto = root.querySelector('#rev-produto').value;

    try {
      await setDoc(
        doc(db, 'equipes', equipeId, 'missoes', missaoId, 'revisoes', ultimaEntrega.id),
        {
          em: hoje,
          resultado,
          produto,
          criterios,
        }
      );
      await updateDoc(doc(db, 'equipes', equipeId, 'missoes', missaoId), {
        concluidaEm: resultado === 'concluida' ? hoje : null,
      });
      mostrarAviso(
        resultado === 'concluida' ? 'Missão revisada como Concluída!' : 'Revisão salva (Em ajuste).',
        'sucesso'
      );
    } catch (err) {
      mostrarAviso('Erro ao salvar revisão: ' + err.message, 'erro');
    }
  });

  // BLOCO 5: Registro do dia (1 linha + auto-complete em até 3 toques)
  const inpData = root.querySelector('#inp-registro-data');
  const inpAtiv = root.querySelector('#inp-registro-atividade');
  const boxAuto = root.querySelector('#box-autocomplete');

  const gravarRegistro = async (payload) => {
    const diaAlvo = uiFolha.diaSelecionado || hoje;
    try {
      await setDoc(
        doc(db, 'equipes', equipeId, 'missoes', missaoId, 'registros', diaAlvo),
        payload
      );
      uiFolha.mostrarAutocomplete = false;
      if (boxAuto) boxAuto.style.display = 'none';
      mostrarAviso(`Registrado em ${formatarDiaRegistro(diaAlvo)}.`, 'sucesso');
    } catch (err) {
      mostrarAviso('Erro ao registrar dia: ' + err.message, 'erro');
    }
  };

  const atualizarAutocomplete = (prefixo) => {
    if (!boxAuto) return;
    const filtro = Object.values(ROTULO_MOTIVO).includes(prefixo) ? '' : prefixo;
    const sugestoes = sugerirAtividades(r, filtro, 8);
    boxAuto.innerHTML = `
      ${sugestoes
        .map(
          (s, i) => `
        <button type="button" class="autocomplete-item ${i === 0 ? 'ativo' : ''}" data-sugestao-atividade="${esc(s)}">
          ${esc(s)}
        </button>
      `
        )
        .join('')}
      ${sugestoes.length > 0 ? `<hr class="divisor" style="margin:2px 0;" />` : ''}
      ${Object.entries(ROTULO_MOTIVO)
        .map(
          ([cod, rot]) => `
        <button type="button" class="autocomplete-item motivo" data-sugestao-motivo="${cod}">
          ${esc(rot)}
        </button>
      `
        )
        .join('')}
    `;
    boxAuto.style.display = '';

    // Critério 2: Tocar na sugestão preenche e grava imediatamente (total: 2 toques!)
    boxAuto.querySelectorAll('[data-sugestao-atividade]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ativ = btn.getAttribute('data-sugestao-atividade').trim();
        uiFolha.textoAtividade = ativ;
        if (inpAtiv) inpAtiv.value = ativ;
        gravarRegistro({ atividade: ativ });
      });
    });

    boxAuto.querySelectorAll('[data-sugestao-motivo]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const motivo = btn.getAttribute('data-sugestao-motivo');
        uiFolha.textoAtividade = ROTULO_MOTIVO[motivo];
        if (inpAtiv) inpAtiv.value = ROTULO_MOTIVO[motivo];
        gravarRegistro({ motivo });
      });
    });
  };

  inpData?.addEventListener('change', () => {
    const novoDia = inpData.value || hoje;
    uiFolha.diaSelecionado = novoDia;
    const reg = r.registros.find((x) => x.dia === novoDia);
    uiFolha.textoAtividade = reg
      ? reg.atividade || ROTULO_MOTIVO[reg.motivo] || ''
      : '';
    renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao });
  });

  inpAtiv?.addEventListener('focus', () => {
    uiFolha.mostrarAutocomplete = true;
    atualizarAutocomplete(inpAtiv.value);
  });

  inpAtiv?.addEventListener('input', () => {
    uiFolha.textoAtividade = inpAtiv.value;
    uiFolha.mostrarAutocomplete = true;
    atualizarAutocomplete(inpAtiv.value);
  });

  root.querySelector('#form-registro-dia')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = (inpAtiv?.value || '').trim();
    if (!val) return;
    const parMotivo = Object.entries(ROTULO_MOTIVO).find(
      ([, rot]) => rot.toLowerCase() === val.toLowerCase()
    );
    if (parMotivo) {
      gravarRegistro({ motivo: parMotivo[0] });
    } else {
      gravarRegistro({ atividade: val.slice(0, 80).trim() });
    }
  });
}
