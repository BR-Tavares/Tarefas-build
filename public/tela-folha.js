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
} from './adaptador.js';
import {
  db,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
} from './firebase-config.js';

// Estado local de UI da folha (para não fechar modais/expanders ao receber snapshot)
const uiFolha = {
  missaoId: null,
  verMaisDescricao: false,
  editandoLinks: false,
  editandoEtapas: false,
  abrindoPendencia: false,
  respondendoPendenciaId: null,
  preenchendoEntrega: false,
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
  const { missaoId, aoVoltar, aoAbrirEdicaoMissao } = opcoes;

  const missaoDoc = missoesMap[missaoId];
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
  const subs = subcolecoesMap[missaoId] || {};
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
    uiFolha.abrindoPendencia = false;
    uiFolha.respondendoPendenciaId = null;
    uiFolha.preenchendoEntrega = false;
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
    papel === 'responsavel' && sit !== 'concluida' && sit !== 'cancelada';

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

      <!-- BLOCO 1: CABEÇALHO -->
      <section class="card">
        <div class="meta-codigo">
          <span>${esc(g.codigo)} · versão ${g.versao}</span>
          <button type="button" id="btn-toggle-links" class="link-acao" style="font-size:11px;">
            ${uiFolha.editandoLinks ? 'fechar links' : 'editar links'}
          </button>
        </div>

        <h1 class="titulo-missao">
          ${esc(g.titulo)} ${badgeMudou('titulo')}
        </h1>

        <div class="pills-row">
          ${
            links.docsUrl
              ? `<a class="pill-link" href="${esc(links.docsUrl)}" target="_blank" rel="noopener noreferrer">Docs ↗</a>`
              : `<button type="button" class="pill-link" id="btn-atalho-docs" style="opacity:0.7;cursor:pointer;">+ Docs ↗</button>`
          }
          ${
            links.pastaUrl
              ? `<a class="pill-link" href="${esc(links.pastaUrl)}" target="_blank" rel="noopener noreferrer">Pasta ↗</a>`
              : `<button type="button" class="pill-link" id="btn-atalho-pasta" style="opacity:0.7;cursor:pointer;">+ Pasta ↗</button>`
          }
        </div>

        ${
          uiFolha.editandoLinks
            ? `
          <form id="form-editar-links" style="background:var(--bg);padding:10px;border-radius:8px;margin-bottom:10px;">
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

        <div class="pills-row" style="margin-bottom:0;">
          <span class="badge ${rotSit.classe}">${esc(rotSit.texto)}</span>
          <span class="badge badge-neutro">
            Data estimada ${esc(formatarDataCurta(dataEstExibida))}${
              diasSuspensos > 0 ? ` (+${diasSuspensos} por impedimento)` : ''
            }
          </span>
          ${badgeMudou('dataEstimada')}
        </div>

        <hr class="divisor" />

        <div class="rotulo-campo">NECESSIDADE ${badgeMudou('necessidade')}</div>
        <p class="texto-campo">${esc(g.descricao.necessidade)}</p>

        <div class="rotulo-campo">TAREFA ${badgeMudou('tarefa')}</div>
        <p class="texto-campo">${esc(g.descricao.tarefa)}</p>

        <div class="rotulo-campo">ENTREGA ${badgeMudou('entrega')}</div>
        <p class="texto-campo">${esc(g.descricao.entrega)}</p>

        <div class="rotulo-campo">CRITÉRIO DE CONCLUSÃO ${badgeMudou('criterios')}</div>
        ${(g.descricao.criterios || [])
          .map(
            (c) => `
          <p class="texto-campo" style="margin-bottom:4px;">
            ${esc(c.condicao)} — verificado por ${esc(ROTULO_VERIFICACAO[c.verificacao] || c.verificacao)}
          </p>
        `
          )
          .join('')}

        <div style="margin-top:8px;">
          <button type="button" id="btn-ver-mais-desc" class="link-acao">
            ${uiFolha.verMaisDescricao ? 'Ocultar resultado esperado e insumos ▴' : 'Ver resultado esperado e insumos ▾'}
          </button>
        </div>

        ${
          uiFolha.verMaisDescricao
            ? `
          <div style="margin-top:8px;padding-top:6px;border-top:1px dashed var(--border);">
            <div class="rotulo-campo">RESULTADO ESPERADO ${badgeMudou('resultadoEsperado')}</div>
            <p class="texto-campo">${esc(g.descricao.resultadoEsperado)}</p>
            <div class="rotulo-campo">INSUMOS ${badgeMudou('insumos')}</div>
            <p class="texto-campo">${esc(g.descricao.insumos || '—')}</p>
          </div>
        `
            : ''
        }

        <div style="margin-top:14px;">
          <div class="secao-titulo" style="font-size:13px;">Requisitos da tarefa</div>

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

          <div class="rotulo-campo rotulo-azul">CONSULTAR ANTES ${badgeMudou('consultarAntes')}</div>
          <p class="texto-campo" style="margin-bottom:0;">${
            (g.requisitos.consultarAntes || []).length > 0
              ? g.requisitos.consultarAntes.map((x) => esc(x)).join('\n')
              : '—'
          }</p>
        </div>
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
        <div class="secao-sub" style="margin-top:8px;">Uma vez, no início, para alinhar o entendimento.</div>
      </section>

      <!-- BLOCO 3: PENDÊNCIAS -->
      <section class="card">
        <div class="secao-header">
          <h2 class="secao-titulo">Pendências</h2>
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

        ${
          r.pendencias.length === 0
            ? `<p class="secao-sub" style="margin:0;">Nenhuma pendência aberta.</p>`
            : r.pendencias
                .map((p) => {
                  const resp = g.respostas.find((x) => x.pendenciaId === p.id);
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
                              resp.tipo === 'alteracao' ? `ALTERAÇÃO → v${g.versao}` : 'RESPOSTA'
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
                        <div class="pendencia-rodape">
                          <span class="secao-sub">Você abriu, você fecha.</span>
                          <button type="button" class="btn btn-sm btn-outline-azul" data-fechar-pendencia="${esc(p.id)}">
                            Fechar pendência
                          </button>
                        </div>
                      `
                          : ''
                      }

                      ${
                        !p.fechadaEm && papel === 'gestor'
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
                .join('')
        }
      </section>

      <!-- BLOCO 4: ENTREGA, REVISÃO E ENCERRAMENTO -->
      <section class="card">
        <div class="secao-header">
          <div>
            <h2 class="secao-titulo">Entrega</h2>
            <div class="secao-sub">Resultado, evidência por critério, desvios.</div>
          </div>
          ${
            abertaParaEscritaResp
              ? `<button type="button" id="btn-preencher-entrega" class="btn btn-sm">${uiFolha.preenchendoEntrega ? 'Fechar' : 'Preencher'}</button>`
              : ''
          }
        </div>

        ${
          ultimaEntrega
            ? `
          <div style="border-top:1px solid var(--border);padding-top:10px;margin-top:6px;">
            <div class="rotulo-campo" style="margin-top:0;">Entrega registrada em ${esc(formatarDataCurta(ultimaEntrega.em))}</div>
            <p class="texto-campo"><strong>Resultado:</strong> ${esc(ultimaEntrega.resultado)}</p>
            <div class="rotulo-campo">Evidências por critério</div>
            ${(ultimaEntrega.evidencias || [])
              .map((ev, i) => {
                const crit = g.descricao.criterios?.[i];
                return `
                  <p class="texto-campo" style="margin-bottom:4px;">
                    • <strong>${esc(crit?.condicao || `Critério ${i + 1}`)}:</strong>
                    [${esc(ev.status)}] — ${esc(ev.onde)}
                  </p>
                `;
              })
              .join('')}
            <p class="texto-campo"><strong>Desvios e limites:</strong> ${esc(ultimaEntrega.desvios || 'Nenhum')}</p>

            ${
              ultimaRevisao
                ? `
              <div class="resposta-box" style="margin-top:8px;">
                <div class="resposta-titulo">
                  Revisão do gestor em ${esc(formatarDataCurta(ultimaRevisao.em))} ·
                  Missão: ${ultimaRevisao.resultado === 'concluida' ? 'CONCLUÍDA' : 'EM AJUSTE'} ·
                  Produto: ${esc(ultimaRevisao.produto.toUpperCase())}
                </div>
                ${
                  (ultimaRevisao.ajustes || []).length > 0
                    ? `<p class="texto-campo" style="margin:4px 0 0 0;"><strong>Ajustes necessários:</strong> ${esc(ultimaRevisao.ajustes.join('; '))}</p>`
                    : ''
                }
              </div>
            `
                : `<div class="secao-sub" style="margin-top:6px;">Aguardando revisão do gestor.</div>`
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
              <label for="ent-resultado">Resultado (separe o dado da interpretação)</label>
              <textarea id="ent-resultado" class="textarea" required placeholder="Ex.: Erro médio de 2,4 p.p. nas 12 medições.">${esc(ultimaEntrega?.resultado || '')}</textarea>
            </div>

            <div class="campo-form">
              <label>Evidência por critério de conclusão</label>
              ${(g.descricao.criterios || [])
                .map(
                  (c, idx) => `
                <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:8px;margin-bottom:6px;">
                  <div style="font-size:12px;font-weight:600;margin-bottom:6px;">
                    ${esc(c.condicao)} (${esc(ROTULO_VERIFICACAO[c.verificacao] || c.verificacao)})
                  </div>
                  <div style="display:grid;grid-template-columns:130px 1fr;gap:6px;">
                    <select class="select ev-status" data-idx="${idx}">
                      <option value="atendido">Atendido</option>
                      <option value="parcial">Parcial</option>
                      <option value="nao_atendido">Não atendido</option>
                    </select>
                    <input class="input ev-onde" type="text" placeholder="Onde está a evidência (no Docs ou na pasta)" required />
                  </div>
                </div>
              `
                )
                .join('')}
            </div>

            <div class="campo-form">
              <label for="ent-desvios">Desvios e limites</label>
              <div class="ajuda">O que mudou em relação ao combinado, se algum requisito ficou em risco e o que o resultado não permite concluir.</div>
              <textarea id="ent-desvios" class="textarea" placeholder="Ex.: O resultado não vale para umidade acima do nível 4.">${esc(ultimaEntrega?.desvios || '')}</textarea>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:6px;">
              <button type="submit" class="btn btn-sm btn-primario">Registrar entrega</button>
            </div>
          </form>
        `
            : ''
        }

        ${
          papel === 'gestor' && ultimaEntrega && !ultimaRevisao
            ? `
          <form id="form-revisao-gestor" style="background:var(--bg);padding:12px;border-radius:8px;margin-top:12px;">
            <h3 class="secao-titulo" style="margin-bottom:8px;">Revisão do Gestor</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <div class="campo-form">
                <label for="rev-resultado">1. A missão foi concluída?</label>
                <select id="rev-resultado" class="select" required>
                  <option value="concluida">Concluída (critérios e requisitos cumpridos)</option>
                  <option value="em_ajuste">Em ajuste (critério ou requisito pendente)</option>
                </select>
              </div>
              <div class="campo-form">
                <label for="rev-produto">2. O que o resultado diz sobre o produto?</label>
                <select id="rev-produto" class="select" required>
                  <option value="atende">Atende</option>
                  <option value="nao_atende">Não atende</option>
                  <option value="inconclusivo">Inconclusivo</option>
                </select>
              </div>
            </div>
            <div class="campo-form">
              <label for="rev-ajustes">Ajustes (se ficar "Em ajuste", aponte o critério/requisito não cumprido, um por linha)</label>
              <textarea id="rev-ajustes" class="textarea" rows="2"></textarea>
            </div>
            <div class="campo-form">
              <label for="rev-frase-gestor">Encerramento do gestor (1 frase): O que muda na próxima folha?</label>
              <input id="rev-frase-gestor" class="input" type="text" value="${esc(g.fraseGestor || '')}" placeholder="Ex.: Nas próximas calibrações, a capacidade da estufa entra nos insumos." />
            </div>
            <div style="display:flex;justify-content:flex-end;">
              <button type="submit" class="btn btn-sm btn-primario">Salvar revisão</button>
            </div>
          </form>
        `
            : ''
        }

        ${
          sit === 'concluida'
            ? `
          <div style="border-top:1px solid var(--border);padding-top:10px;margin-top:10px;">
            <div class="rotulo-campo" style="margin-top:0;">Encerramento (aprendizado para as próximas folhas)</div>
            ${
              papel === 'responsavel'
                ? `
              <form id="form-frase-responsavel" style="margin-top:6px;">
                <div class="campo-form" style="margin-bottom:6px;">
                  <label for="inp-frase-resp">Em uma frase: O que a folha deveria ter dito desde o início?</label>
                  <input id="inp-frase-resp" class="input" type="text" value="${esc(r.fraseResponsavel || '')}" placeholder="Ex.: A folha deveria ter dito a capacidade da estufa." required />
                </div>
                <button type="submit" class="btn btn-sm btn-primario">Salvar frase de encerramento</button>
              </form>
            `
                : `<p class="texto-campo"><strong>Responsável (o que a folha deveria ter dito):</strong> ${esc(r.fraseResponsavel || 'Ainda não preenchido')}</p>`
            }
            ${
              papel === 'gestor'
                ? `
              <form id="form-frase-gestor" style="margin-top:8px;">
                <div class="campo-form" style="margin-bottom:6px;">
                  <label for="inp-frase-gest">Em uma frase: O que muda na próxima folha?</label>
                  <input id="inp-frase-gest" class="input" type="text" value="${esc(g.fraseGestor || '')}" placeholder="Ex.: Nas próximas calibrações, a capacidade da estufa entra nos insumos." required />
                </div>
                <button type="submit" class="btn btn-sm btn-primario">Salvar frase do gestor</button>
              </form>
            `
                : g.fraseGestor
                ? `<p class="texto-campo" style="margin-top:6px;"><strong>Gestor (o que muda na próxima folha):</strong> ${esc(g.fraseGestor)}</p>`
                : ''
            }
          </div>
        `
            : ''
        }
      </section>

      <!-- BLOCO 5: REGISTRO DO DIA (exclusivo para o responsável — 1 linha, sem histórico, sem contagem e sem alerta) -->
      ${
        abertaParaEscritaResp
          ? `
        <section class="card card-destaque-azul">
          <div class="secao-header" style="margin-bottom:8px;">
            <h2 class="secao-titulo">Registro do dia</h2>
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
                placeholder="Atividade principal do dia..."
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

  root.querySelector('#btn-voltar-lista')?.addEventListener('click', () => aoVoltar?.());

  root.querySelector('#btn-ver-mais-desc')?.addEventListener('click', () => {
    uiFolha.verMaisDescricao = !uiFolha.verMaisDescricao;
    renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao });
  });

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

  // Etapas (responsável)
  root.querySelector('#btn-editar-etapas')?.addEventListener('click', () => {
    uiFolha.editandoEtapas = !uiFolha.editandoEtapas;
    renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao });
  });
  root.querySelector('#btn-cancelar-etapas')?.addEventListener('click', () => {
    uiFolha.editandoEtapas = false;
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

  // Pendências
  root.querySelector('#btn-abrir-pendencia')?.addEventListener('click', () => {
    uiFolha.abrindoPendencia = !uiFolha.abrindoPendencia;
    renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao });
  });
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

  // Entrega e Revisão
  root.querySelector('#btn-preencher-entrega')?.addEventListener('click', () => {
    uiFolha.preenchendoEntrega = !uiFolha.preenchendoEntrega;
    renderizarTelaFolha(root, estadoApp, { missaoId, aoVoltar, aoAbrirEdicaoMissao });
  });

  root.querySelector('#form-entrega')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const resultado = root.querySelector('#ent-resultado').value.trim();
    const desvios = root.querySelector('#ent-desvios').value.trim();
    const statusEls = [...root.querySelectorAll('.ev-status')];
    const ondeEls = [...root.querySelectorAll('.ev-onde')];
    const evidencias = statusEls.map((sEl, idx) => ({
      criterio: idx,
      status: sEl.value,
      onde: ondeEls[idx].value.trim(),
    }));

    try {
      const entRef = doc(collection(db, 'equipes', equipeId, 'missoes', missaoId, 'entregas'));
      await setDoc(entRef, {
        em: hoje,
        resultado,
        evidencias,
        desvios,
      });
      uiFolha.preenchendoEntrega = false;
      mostrarAviso('Entrega registrada!', 'sucesso');
    } catch (err) {
      mostrarAviso('Erro ao registrar entrega: ' + err.message, 'erro');
    }
  });

  root.querySelector('#form-revisao-gestor')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ultimaEntrega = r.entregas.at(-1);
    if (!ultimaEntrega) return;
    const resultado = root.querySelector('#rev-resultado').value;
    const produto = root.querySelector('#rev-produto').value;
    const ajustes = root
      .querySelector('#rev-ajustes')
      .value.split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const fraseGestor = root.querySelector('#rev-frase-gestor').value.trim();

    try {
      await setDoc(
        doc(db, 'equipes', equipeId, 'missoes', missaoId, 'revisoes', ultimaEntrega.id),
        {
          em: hoje,
          resultado,
          produto,
          ajustes,
        }
      );
      await updateDoc(doc(db, 'equipes', equipeId, 'missoes', missaoId), {
        fraseGestor: fraseGestor || g.fraseGestor || '',
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

  root.querySelector('#form-frase-responsavel')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fraseResponsavel = root.querySelector('#inp-frase-resp').value.trim();
    try {
      await updateDoc(
        doc(db, 'equipes', equipeId, 'missoes', missaoId, 'responsavel', 'estado'),
        { fraseResponsavel }
      );
      mostrarAviso('Frase de encerramento salva.', 'sucesso');
    } catch (err) {
      mostrarAviso('Erro ao salvar frase: ' + err.message, 'erro');
    }
  });

  root.querySelector('#form-frase-gestor')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fraseGestor = root.querySelector('#inp-frase-gest').value.trim();
    try {
      await updateDoc(doc(db, 'equipes', equipeId, 'missoes', missaoId), { fraseGestor });
      mostrarAviso('Frase do gestor salva.', 'sucesso');
    } catch (err) {
      mostrarAviso('Erro ao salvar frase: ' + err.message, 'erro');
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
