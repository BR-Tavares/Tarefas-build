import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  diasUteis,
  somaDiasUteis,
  situacao,
  dataExibida,
  sugerirAtividades,
  sequencias,
  sinais,
  linhaPainel,
  linhaDoTempo,
} from '../public/analise.js';
import {
  montarObjetosAnalise,
  obterLinksVigentes,
} from '../public/adaptador.js';

function criarMS027Base() {
  const g = {
    id: 'MS-027',
    codigo: 'MS-027',
    titulo: 'Calibrar sensor de umidade em solo argiloso',
    responsavel: { nome: 'Marina', email: 'marina@exemplo.com' },
    responsavelEmail: 'marina@exemplo.com',
    emitidaEm: '2026-10-19',
    dataEstimada: '2026-10-28',
    versao: 2,
    cancelada: null,
    respostas: [
      {
        pendenciaId: 'p1',
        em: '2026-10-22',
        tipo: 'alteracao',
        texto: 'De acordo: o critério passa a 4 níveis × 3 rep.',
      },
    ],
    alteracoes: [
      {
        id: 'a1',
        versao: 2,
        em: '2026-10-22',
        resumo: 'Critério de conclusão ajustado para 4 níveis × 3 repetições.',
        pendenciaId: 'p1',
      },
    ],
    revisoes: [],
  };

  const r = {
    vistoVersao: 2,
    primeiroPlanoEm: '2026-10-19',
    etapas: [
      { id: 'e1', ordem: 1, nome: 'Amostras preparadas', concluidaEm: '2026-10-19' },
      { id: 'e2', ordem: 2, nome: 'Níveis 1 a 3 medidos', concluidaEm: null },
      { id: 'e3', ordem: 3, nome: 'Nível 4 medido', concluidaEm: null },
      { id: 'e4', ordem: 4, nome: 'Planilha consolidada', concluidaEm: null },
    ],
    registros: [
      { dia: '2026-10-19', atividade: 'preparar amostras n1' },
      { dia: '2026-10-20', atividade: 'secar amostras n1' },
      { dia: '2026-10-21', atividade: 'secar amostras n1' },
      { dia: '2026-10-22', atividade: 'secar amostras n1' },
    ],
    pendencias: [
      {
        id: 'p1',
        tipo: 'impedimento',
        bloqueio: 'parte',
        texto: 'A estufa só seca 3 amostras por ciclo: 5 níveis não cabem até 28/10.',
        abertaEm: '2026-10-22',
        fechadaEm: '2026-10-22',
      },
    ],
    entregas: [],
  };

  return { g, r };
}

describe('analise.js & adaptador.js — Critérios de Aceite (Seção 12)', () => {
  it('Critério 5: Uma alteração avança a versão e aparece como "não vista" até o responsável abrir a folha', () => {
    const { g, r } = criarMS027Base();
    r.vistoVersao = 1; // Responsável viu a v1, mas a missão já está na v2
    const antes = linhaPainel(g, r, '2026-10-22', []);
    assert.equal(antes.versao, 2);
    assert.equal(antes.versaoNaoVista, true);

    r.vistoVersao = 2; // Responsável abriu a folha na v2
    const depois = linhaPainel(g, r, '2026-10-22', []);
    assert.equal(depois.versaoNaoVista, false);
  });

  it('Critério 7: MS-027 em 23/10 — atividade atual secar amostras n1, 3 dias seguidos, etapas 1/4, sem sinais', () => {
    const { g, r } = criarMS027Base();
    const linha = linhaPainel(g, r, '2026-10-23', []);

    assert.equal(linha.atividadeAtual, 'secar amostras n1');
    assert.equal(linha.diasSeguidosNaAtividade, 3);
    assert.equal(linha.etapas, '1/4');
    assert.deepEqual(linha.sinais, []);
  });

  it('Critério 8: MS-027 em 29/10 (impedimento ainda aberto) — dias sem registro (4 dias úteis), data estimada passou, impedimento respondido e aberto há 5 dias úteis', () => {
    const { g, r } = criarMS027Base();
    r.pendencias[0].fechadaEm = null;

    const listaSinais = sinais(g, r, '2026-10-29', []);
    const mapa = Object.fromEntries(listaSinais.map((s) => [s.sinal, s]));

    assert.ok(mapa.dias_sem_registro);
    assert.equal(mapa.dias_sem_registro.detalhe, '4 dias úteis');
    assert.equal(mapa.dias_sem_registro.notifica, false);

    assert.ok(mapa.data_estimada_passou);
    assert.equal(mapa.data_estimada_passou.detalhe, 'era 28/10');
    assert.equal(mapa.data_estimada_passou.notifica, false);

    assert.ok(mapa.impedimento_aberto);
    assert.equal(mapa.impedimento_aberto.detalhe, 'respondido, mas aberto há 5 dias úteis');
    assert.equal(mapa.impedimento_aberto.notifica, true);
  });

  it('Critério 9: Impedimento total sem resposta por 5 dias úteis — situação "impedida", data estimada avança 5 dias úteis, sem sinal de dias sem registro', () => {
    const { g, r } = criarMS027Base();
    g.respostas = [];
    r.pendencias = [
      {
        id: 'p-tot',
        tipo: 'impedimento',
        bloqueio: 'tudo',
        texto: 'Equipamento de referência em manutenção externa.',
        abertaEm: '2026-10-22',
        fechadaEm: null,
      },
    ];

    assert.equal(situacao(g, r), 'impedida');
    const exibida = dataExibida(g, r, '2026-10-29', []);
    assert.equal(exibida.diasSuspensos, 5);
    assert.equal(exibida.data, '2026-11-04');

    const listaSinais = sinais(g, r, '2026-10-29', []);
    assert.equal(
      listaSinais.some((s) => s.sinal === 'dias_sem_registro'),
      false
    );
    assert.equal(
      listaSinais.some((s) => s.sinal === 'pendencia_sem_resposta' && s.notifica === true),
      true
    );
  });

  it('Critério 10: Entrega sem revisão há 5 dias úteis — sinal de espera pela revisão, que notifica', () => {
    const { g, r } = criarMS027Base();
    r.entregas = [
      {
        id: 'ent-1',
        em: '2026-10-22',
        resultado: 'Erro médio de 2,4 p.p.',
        evidencias: [{ criterio: 0, status: 'atendido', onde: 'Planilha na pasta' }],
        desvios: 'Nenhum',
      },
    ];

    assert.equal(situacao(g, r), 'entregue');
    const listaSinais = sinais(g, r, '2026-10-29', []);
    assert.equal(listaSinais.length, 1);
    assert.equal(listaSinais[0].sinal, 'espera_revisao');
    assert.equal(listaSinais[0].detalhe, 'entregue há 5 dias úteis');
    assert.equal(listaSinais[0].notifica, true);
  });

  it('Critério 11: Feriado cadastrado na equipe não conta como dia útil', () => {
    const semFeriado = diasUteis('2026-10-29', '2026-11-04', []);
    const comFinados = diasUteis('2026-10-29', '2026-11-04', ['2026-11-02']);

    assert.equal(semFeriado, 4);
    assert.equal(comFinados, 3);
    assert.equal(somaDiasUteis('2026-10-29', 3, ['2026-11-02']), '2026-11-04');
  });

  it('Adaptador e links editáveis por gestor e responsável mantendo único escritor por documento', () => {
    const { g, r } = montarObjetosAnalise(
      {
        id: 'MS-027',
        codigo: 'MS-027',
        titulo: 'Teste',
        responsavelEmail: 'marina@exemplo.com',
        docsUrl: 'https://docs.google.com/gestor-v1',
        pastaUrl: 'https://drive.google.com/gestor-v1',
        linksEm: '2026-10-19T10:00:00Z',
        emitidaEm: '2026-10-19',
        dataEstimada: '2026-10-28',
        versao: 1,
      },
      {
        estado: {
          vistoVersao: 1,
          docsUrl: 'https://docs.google.com/resp-v2',
          pastaUrl: 'https://drive.google.com/resp-v2',
          linksEm: '2026-10-20T12:00:00Z',
          etapas: [],
        },
      }
    );

    const links = obterLinksVigentes(g, r);
    assert.equal(links.docsUrl, 'https://docs.google.com/resp-v2');
    assert.equal(links.pastaUrl, 'https://drive.google.com/resp-v2');
  });

  it('Auto-complete, sequências com motivo no meio e linha do tempo', () => {
    const { r } = criarMS027Base();
    r.registros.push(
      { dia: '2026-10-23', motivo: 'outra_missao' },
      { dia: '2026-10-26', atividade: 'Secar amostras N1' }
    );

    const seq = sequencias(r);
    assert.equal(seq.at(-1).dias, 4);

    const sugestoes = sugerirAtividades(r, 'sec');
    assert.equal(sugestoes.length, 1);
    assert.equal(sugestoes[0].toLowerCase(), 'secar amostras n1');

    const tl = linhaDoTempo(r);
    assert.equal(tl.length, 6);
    assert.equal(tl[4].texto, 'sem trabalho: outra_missao');
  });
});
