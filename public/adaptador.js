// Adaptador entre os documentos do Firestore (Seção 5 da especificação)
// e os objetos puros { g, r } consumidos por analise.js.

export function montarObjetosAnalise(missaoDoc, subcolecoes = {}, membrosMap = {}) {
  const {
    alteracoes = [],
    respostas = [],
    revisoes = [],
    estado = null,
    registros = [],
    pendencias = [],
    entregas = [],
    planos = [],
  } = subcolecoes;

  const respEmail = missaoDoc.responsavelEmail || '';
  const membro = membrosMap[respEmail] || {
    nome: missaoDoc.responsavelNome || respEmail.split('@')[0] || 'Responsável',
    email: respEmail,
  };

  const g = {
    id: missaoDoc.codigo || missaoDoc.id,
    docId: missaoDoc.id,
    codigo: missaoDoc.codigo || missaoDoc.id,
    titulo: missaoDoc.titulo || '',
    gestorUid: missaoDoc.gestorUid || '',
    responsavelEmail: respEmail,
    responsavel: {
      nome: membro.nome || respEmail,
      email: respEmail,
    },
    docsUrl: missaoDoc.docsUrl || '',
    pastaUrl: missaoDoc.pastaUrl || '',
    linksEm: missaoDoc.linksEm || '',
    emitidaEm: missaoDoc.emitidaEm || null,
    dataEstimada: missaoDoc.dataEstimada || '',
    versao: missaoDoc.versao ?? 1,
    descricao: missaoDoc.descricao || {
      necessidade: '',
      resultadoEsperado: '',
      tarefa: '',
      entrega: '',
      criterios: [],
      insumos: '',
    },
    requisitos: missaoDoc.requisitos || {
      precisa: [],
      naoPode: [],
      consultarAntes: [],
    },
    camposMudaramUltimaVersao: missaoDoc.camposMudaramUltimaVersao || [],
    fraseGestor: missaoDoc.fraseGestor || '',
    cancelada: missaoDoc.cancelada || null,
    concluidaEm: missaoDoc.concluidaEm || null,
    alteracoes: [...alteracoes].sort((a, b) => (a.versao ?? 0) - (b.versao ?? 0)),
    respostas: respostas.map((x) => ({
      ...x,
      pendenciaId: x.pendenciaId || x.id,
    })),
    revisoes: revisoes.map((x) => ({
      ...x,
      entregaId: x.entregaId || x.id,
    })),
    planos: [...planos].sort((a, b) => (a.em || '').localeCompare(b.em || '')),
  };

  const est = estado || {};
  const r = {
    vistoVersao: est.vistoVersao ?? 0,
    primeiroPlanoEm: est.primeiroPlanoEm || null,
    etapas: [...(est.etapas || [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
    fraseResponsavel: est.fraseResponsavel || '',
    docsUrl: est.docsUrl,
    pastaUrl: est.pastaUrl,
    linksEm: est.linksEm || '',
    registros: registros.map((reg) => ({
      dia: reg.dia || reg.id,
      ...(reg.atividade ? { atividade: reg.atividade } : {}),
      ...(reg.motivo ? { motivo: reg.motivo } : {}),
    })),
    pendencias: [...pendencias].sort((a, b) => (a.abertaEm || '').localeCompare(b.abertaEm || '')),
    entregas: [...entregas].sort((a, b) => (a.em || '').localeCompare(b.em || '')),
  };

  return { g, r };
}

// Retorna os links de Docs e Pasta vigentes (permite que tanto gestor quanto
// responsável atualizem os links mantendo um único escritor por documento).
export function obterLinksVigentes(g, r) {
  const rMaisRecente = r?.linksEm && (!g?.linksEm || r.linksEm > g.linksEm);
  return {
    docsUrl: (rMaisRecente ? r.docsUrl : g?.docsUrl) || '',
    pastaUrl: (rMaisRecente ? r.pastaUrl : g?.pastaUrl) || '',
  };
}

export const ROTULO_SITUACAO = {
  rascunho: { texto: 'Rascunho', classe: 'badge-neutro' },
  em_execucao: { texto: 'Em execução', classe: 'badge-verde' },
  impedida: { texto: 'Impedida', classe: 'badge-vermelho' },
  entregue: { texto: 'Entregue', classe: 'badge-azul' },
  em_ajuste: { texto: 'Em ajuste', classe: 'badge-amarelo' },
  concluida: { texto: 'Concluída', classe: 'badge-concluida' },
  cancelada: { texto: 'Cancelada', classe: 'badge-neutro' },
};

export const ROTULO_VERIFICACAO = {
  inspecao: 'inspeção',
  analise: 'análise',
  demonstracao: 'demonstração',
  teste: 'teste',
};

export const ROTULO_PRODUTO = {
  atende: 'Atende ao esperado',
  nao_atende: 'Não atende aos requisitos',
  inconclusivo: 'Inconclusivo / precisa rever',
};

export const ROTULO_MOTIVO = {
  folga_saude: 'Sem trabalho: folga ou saúde',
  outra_missao: 'Sem trabalho: outra missão',
  fora_de_missao: 'Sem trabalho: fora de missão',
};

export const ROTULO_TIPO_PENDENCIA = {
  duvida: 'DÚVIDA',
  consulta: 'CONSULTA',
  impedimento: 'IMPEDIMENTO',
  nova_data: 'NOVA DATA',
};

export const ROTULO_BLOQUEIO = {
  tudo: 'bloqueia tudo',
  parte: 'só uma parte',
  nenhum: 'sem bloqueio',
};

export const ROTULO_SINAL = {
  dias_sem_registro: 'Dias sem registro',
  data_estimada_passou: 'Data estimada passou',
  pendencia_sem_resposta: 'Pendência sem resposta',
  impedimento_aberto: 'Impedimento respondido e aberto',
  espera_revisao: 'Espera pela revisão',
};
