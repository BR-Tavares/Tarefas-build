import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { verificarMissao, verificarPlano, podemComecar } from '../.agents/skills/redigir-missao/verificar.js';

// Exemplos da skill redigir-missao: cada um traz a missão original, o
// veredito esperado e o plano que a skill deve produzir. Os testes garantem
// que os exemplos ensinam o que a skill diz e respeitam o contrato do app;
// não avaliam a resposta de um modelo de IA em tempo real.
const PASTA = new URL('../.agents/skills/redigir-missao/exemplos/', import.meta.url);
const exemplos = Object.fromEntries(
  readdirSync(PASTA)
    .filter((f) => f.endsWith('.json'))
    .map((f) => [f.replace('.json', ''), JSON.parse(readFileSync(new URL(f, PASTA), 'utf8'))]),
);

const norm = (s) =>
  String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
const textoDe = (m) => norm(JSON.stringify(m));
const semChave = ({ chave, ...m }) => m;

describe('redigir-missao: exemplos respeitam o contrato', () => {
  for (const [nome, ex] of Object.entries(exemplos)) {
    it(`${nome}: plano válido e veredito esperado`, () => {
      assert.deepEqual(verificarPlano(ex.plano), []);
      assert.equal(ex.plano.avaliacao.veredito, ex.esperado);
    });
  }
});

describe('redigir-missao: cenários', () => {
  it('1 — missão simples fica igual (MANTER)', () => {
    const ex = exemplos['1-manter'];
    assert.deepEqual(verificarMissao(ex.original), []);
    assert.deepEqual(semChave(ex.plano.missoes[0]), ex.original);
  });

  it('2 — missão redundante: original tem problemas, versão corrigida não, e é mais curta (SIMPLIFICAR)', () => {
    const ex = exemplos['2-simplificar'];
    const problemas = verificarMissao(ex.original).map((p) => p.problema);
    assert.ok(problemas.includes('termo vago sem parâmetro'));
    assert.ok(problemas.includes('repete um requisito ou a tarefa'));
    const corrigida = semChave(ex.plano.missoes[0]);
    assert.deepEqual(verificarMissao(corrigida), []);
    assert.ok(JSON.stringify(corrigida.descricao).length < JSON.stringify(ex.original.descricao).length);
  });

  it('3 — múltiplos resultados viram missões com dependência (DIVIDIR)', () => {
    const { plano } = exemplos['3-dividir'];
    assert.equal(plano.missoes.length, 2);
    assert.deepEqual(podemComecar(plano), ['A']);
  });

  it('4 — vários verbos com um resultado não são fragmentados', () => {
    const ex = exemplos['4-falsa-complexidade'];
    assert.ok(['MANTER', 'SIMPLIFICAR'].includes(ex.plano.avaliacao.veredito));
    assert.equal(ex.plano.missoes.length, 1);
  });

  it('5 — investigação aceita resultado inconclusivo com evidência e separa fato de suposição', () => {
    const { original, plano } = exemplos['5-investigacao-inconclusiva'];
    const aceitaIncerteza = (m) => m.descricao.criterios.some((c) => /indisponivel|inconclusiv|insuficiente/.test(norm(c.condicao)));
    assert.equal(aceitaIncerteza(original), false);
    const m = plano.missoes[0];
    assert.ok(aceitaIncerteza(m));
    assert.ok(m.descricao.criterios.some((c) => /fato.*estimativa.*hipotese/.test(norm(c.condicao))));
  });

  for (const nome of ['3-dividir', '6-perda-de-informacao', 'rastreabilidade-bovina']) {
    it(`6 — ${nome}: a divisão não perde requisitos nem informação essencial`, () => {
      const { original, plano, essenciais } = exemplos[nome];
      const textos = plano.missoes.map(textoDe);
      const requisitos = [...original.requisitos.precisa, ...original.requisitos.naoPode];
      for (const r of requisitos) {
        assert.ok(textos.some((t) => t.includes(norm(r))), `requisito perdido: ${r}`);
      }
      for (const e of essenciais) {
        assert.ok(textos.some((t) => t.includes(norm(e))), `informação perdida: ${e}`);
      }
      assert.ok(plano.missoes.reduce((n, m) => n + m.descricao.criterios.length, 0) >= original.descricao.criterios.length);
    });
  }
});

describe('redigir-missao: caso obrigatório da rastreabilidade bovina', () => {
  const { plano } = exemplos['rastreabilidade-bovina'];
  const porChave = Object.fromEntries(plano.missoes.map((m) => [m.chave, m]));

  it('três missões: custos e benefícios em paralelo, recomendação depois das duas', () => {
    assert.deepEqual(plano.missoes.map((m) => m.chave), ['A', 'B', 'C']);
    assert.deepEqual(podemComecar(plano), ['A', 'B']);
    assert.deepEqual(plano.dependencias, [{ missao: 'C', dependeDe: ['A', 'B'] }]);
  });

  it('a missão dependente cita na Necessidade as entregas de que parte, pelo título', () => {
    const necessidade = porChave.C.descricao.necessidade;
    assert.ok(necessidade.includes(porChave.A.titulo));
    assert.ok(necessidade.includes(porChave.B.titulo));
  });

  it('a balança WOW não é tratada como identificação sozinha', () => {
    assert.ok(textoDe(porChave.A).includes(norm('balança WOW junto com o método de identificação')));
    assert.ok(textoDe(porChave.C).includes(norm('Comparar a balança WOW como se identificasse o animal sozinha')));
  });

  it('custos e benefícios aceitam valor indisponível e separam fato, estimativa e hipótese', () => {
    for (const k of ['A', 'B']) {
      const t = textoDe(porChave[k].descricao.criterios);
      assert.match(t, /indisponivel|dados insuficientes/);
      assert.match(t, /(fato|comprovado).*(estimativa|estimado)/);
    }
  });

  it('a recomendação pode concluir sem recomendação, com o que falta para decidir', () => {
    assert.match(textoDe(porChave.C.descricao.criterios), /sem recomendacao conclusiva/);
  });
});

describe('redigir-missao: verificar.js', () => {
  const base = () => JSON.parse(JSON.stringify(exemplos['1-manter'].original));

  it('aponta mais de 3 critérios e verificação fora da lista', () => {
    const m = base();
    m.descricao.criterios = [1, 2, 3, 4].map((i) => ({ condicao: `Critério ${i}`, verificacao: 'teste' }));
    m.descricao.criterios[0].verificacao = 'olhar';
    const problemas = verificarMissao(m).map((p) => p.problema);
    assert.ok(problemas.some((p) => p.startsWith('mais de 3')));
    assert.ok(problemas.some((p) => p.startsWith('verificação fora')));
  });

  it('aceita termo de qualidade quando há parâmetro numérico', () => {
    const m = base();
    m.descricao.criterios = [{ condicao: 'Cobertura completa dos 15 pontos', verificacao: 'inspecao' }];
    assert.deepEqual(verificarMissao(m), []);
  });

  it('rejeita campos do plano dentro da missão gravada', () => {
    const m = { ...base(), chave: 'A' };
    assert.deepEqual(verificarMissao(m), [{ campo: 'chave', problema: 'campo do plano não é gravado na missão' }]);
  });

  it('acusa dependência inexistente e ciclo', () => {
    const plano = JSON.parse(JSON.stringify(exemplos['3-dividir'].plano));
    plano.dependencias = [{ missao: 'A', dependeDe: ['B'] }, { missao: 'B', dependeDe: ['A', 'Z'] }];
    const problemas = verificarPlano(plano).map((p) => p.problema);
    assert.ok(problemas.includes('chave inexistente: Z'));
    assert.ok(problemas.includes('ciclo de dependência'));
  });
});
