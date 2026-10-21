// Skill redigir-missao — conferência objetiva da missão antes de gravar.
//
// Funções puras, sem dependências. Apontam só o que dá para verificar sem
// interpretar a tarefa: contrato de dados, critério vago, critério repetido
// em requisito ou tarefa e coerência das dependências de um plano de divisão.
// Não decidem MANTER / SIMPLIFICAR / DIVIDIR: isso depende do sentido da
// tarefa e fica com quem redige (SKILL.md, seção 2).
// Saída: lista de { campo, problema }; lista vazia = nada a apontar.

export const VERIFICACOES = ['inspecao', 'analise', 'demonstracao', 'teste'];
export const MAX_CRITERIOS = 3; // limite da tela de Nova Missão

// Termos que só são verificáveis com um parâmetro (número, lista ou referência).
const VAGOS = /\b(de qualidade|boa qualidade|completa|completo|satisfat\w*|adequad\w*|bem feito|testar bem|robust\w*)\b/i;
const CAMPOS_DO_PLANO = ['chave', 'avaliacao', 'dependencias', 'dependeDe'];

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export function verificarMissao(m) {
  const p = [];
  const falta = (campo, v) => !String(v || '').trim() && p.push({ campo, problema: 'vazio' });

  falta('titulo', m.titulo);
  falta('descricao.necessidade', m.descricao?.necessidade);
  falta('descricao.tarefa', m.descricao?.tarefa);
  falta('descricao.entrega', m.descricao?.entrega);
  if (m.dataEstimada && !/^\d{4}-\d{2}-\d{2}$/.test(m.dataEstimada)) {
    p.push({ campo: 'dataEstimada', problema: 'formato diferente de AAAA-MM-DD' });
  }

  const criterios = m.descricao?.criterios || [];
  if (criterios.length === 0) p.push({ campo: 'descricao.criterios', problema: 'nenhum critério' });
  if (criterios.length > MAX_CRITERIOS) {
    p.push({ campo: 'descricao.criterios', problema: `mais de ${MAX_CRITERIOS}: simplifique ou divida` });
  }

  const requisitos = [...(m.requisitos?.precisa || []), ...(m.requisitos?.naoPode || [])].map(norm);
  criterios.forEach((c, i) => {
    const campo = `descricao.criterios[${i}]`;
    if (!String(c.condicao || '').trim()) p.push({ campo, problema: 'condição vazia' });
    if (!VERIFICACOES.includes(c.verificacao)) p.push({ campo, problema: `verificação fora de ${VERIFICACOES.join(' / ')}` });
    if (VAGOS.test(c.condicao) && !/\d/.test(c.condicao)) p.push({ campo, problema: 'termo vago sem parâmetro' });
    const n = norm(c.condicao);
    if (n && (requisitos.includes(n) || n === norm(m.descricao?.tarefa))) {
      p.push({ campo, problema: 'repete um requisito ou a tarefa' });
    }
  });

  CAMPOS_DO_PLANO.filter((k) => k in m).forEach((k) =>
    p.push({ campo: k, problema: 'campo do plano não é gravado na missão' }),
  );
  return p;
}

// Plano: { avaliacao: { veredito, justificativa }, missoes: [{ chave, ... }], dependencias: [{ missao, dependeDe }] }
export function verificarPlano(plano) {
  const p = [];
  const veredito = plano.avaliacao?.veredito;
  if (!['MANTER', 'SIMPLIFICAR', 'DIVIDIR'].includes(veredito)) p.push({ campo: 'avaliacao.veredito', problema: 'fora de MANTER / SIMPLIFICAR / DIVIDIR' });
  if (!String(plano.avaliacao?.justificativa || '').trim()) p.push({ campo: 'avaliacao.justificativa', problema: 'vazia' });

  const missoes = plano.missoes || [];
  if (veredito === 'DIVIDIR' && missoes.length < 2) p.push({ campo: 'missoes', problema: 'DIVIDIR com menos de 2 missões' });
  if (veredito !== 'DIVIDIR' && missoes.length !== 1) p.push({ campo: 'missoes', problema: `${veredito} deve trazer 1 missão` });

  const chaves = missoes.map((m) => m.chave);
  if (new Set(chaves).size !== chaves.length) p.push({ campo: 'missoes', problema: 'chave repetida' });
  missoes.forEach(({ chave, ...m }, i) =>
    verificarMissao(m).forEach((x) => p.push({ campo: `missoes[${chave ?? i}].${x.campo}`, problema: x.problema })),
  );

  const deps = new Map((plano.dependencias || []).map((d) => [d.missao, d.dependeDe || []]));
  for (const [missao, de] of deps) {
    [missao, ...de].filter((k) => !chaves.includes(k)).forEach((k) => p.push({ campo: 'dependencias', problema: `chave inexistente: ${k}` }));
  }
  const visitando = new Set();
  const ciclo = (k, vistos = new Set()) => {
    if (visitando.has(k)) return true;
    if (vistos.has(k)) return false;
    visitando.add(k);
    const achou = (deps.get(k) || []).some((d) => ciclo(d, vistos));
    visitando.delete(k);
    vistos.add(k);
    return achou;
  };
  if (chaves.some((k) => ciclo(k))) p.push({ campo: 'dependencias', problema: 'ciclo de dependência' });
  return p;
}

// Missões que podem começar já (não dependem de nenhuma outra do plano).
export function podemComecar(plano) {
  const dependentes = new Set((plano.dependencias || []).filter((d) => d.dependeDe?.length).map((d) => d.missao));
  return (plano.missoes || []).map((m) => m.chave).filter((k) => !dependentes.has(k));
}
