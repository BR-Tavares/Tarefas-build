// Protocolo de missões v2.7 — análise do gestor (módulo do PWA)
//
// Funções puras, sem dependências. Entram os dados da missão montados
// pelo adaptador do Firestore em dois objetos (g: o que o gestor grava;
// r: o que o responsável grava; ver especificacao_app_missoes.md, seção 5),
// a data de hoje e os feriados; sai o que a tela do gestor mostra.
// Roda no app do gestor e na Cloud Function agendada de notificações.
// Datas são strings 'AAAA-MM-DD'. Nada daqui aparece para o responsável,
// exceto sugerirAtividades (só nomes, sem datas).

const DIA = 86400000;
const paraData = (s) => new Date(s.slice(0, 10) + 'T00:00:00Z');
const paraTexto = (d) => d.toISOString().slice(0, 10);
const ehUtil = (d, feriados) => d.getUTCDay() % 6 !== 0 && !feriados.includes(paraTexto(d));

// Dias úteis no intervalo (de, ate].
export function diasUteis(de, ate, feriados = []) {
  let n = 0;
  for (let d = new Date(paraData(de).getTime() + DIA); d <= paraData(ate); d = new Date(d.getTime() + DIA)) {
    if (ehUtil(d, feriados)) n++;
  }
  return n;
}

export function somaDiasUteis(data, n, feriados = []) {
  let d = paraData(data);
  while (n > 0) {
    d = new Date(d.getTime() + DIA);
    if (ehUtil(d, feriados)) n--;
  }
  return paraTexto(d);
}

const respostaDe = (g, p) => g.respostas.find((x) => x.pendenciaId === p.id);
const impedimentosTotais = (r) => r.pendencias.filter((p) => p.tipo === 'impedimento' && p.bloqueio === 'tudo');

// A situação é derivada dos dois arquivos; ninguém a grava.
export function situacao(g, r) {
  if (g.cancelada) return 'cancelada';
  if (!g.emitidaEm) return 'rascunho';
  const entrega = r.entregas.at(-1);
  const revisao = entrega && g.revisoes.find((v) => v.entregaId === entrega.id);
  if (revisao?.resultado === 'concluida') return 'concluida';
  if (entrega && !revisao) return 'entregue';
  if (impedimentosTotais(r).some((p) => !p.fechadaEm && !respostaDe(g, p))) return 'impedida';
  if (revisao?.resultado === 'em_ajuste') return 'em_ajuste';
  return 'em_execucao';
}

// Data estimada exibida: avança pelos dias úteis de impedimento total.
export function dataExibida(g, r, hoje, feriados = []) {
  const suspensos = impedimentosTotais(r).reduce((soma, p) => {
    const fim = respostaDe(g, p)?.em ?? hoje;
    return soma + diasUteis(p.abertaEm, fim, feriados);
  }, 0);
  return { data: somaDiasUteis(g.dataEstimada, suspensos, feriados), diasSuspensos: suspensos };
}

// Auto-complete: atividades já usadas na missão, mais recentes primeiro,
// sem repetir grafias que só diferem em maiúsculas.
export function sugerirAtividades(r, prefixo = '', limite = 8) {
  const vistas = new Set();
  const saida = [];
  for (const reg of [...r.registros].sort((a, b) => b.dia.localeCompare(a.dia))) {
    if (!reg.atividade) continue;
    const chave = reg.atividade.trim().toLowerCase();
    if (vistas.has(chave) || !chave.startsWith(prefixo.trim().toLowerCase())) continue;
    vistas.add(chave);
    saida.push(reg.atividade.trim());
    if (saida.length === limite) break;
  }
  return saida;
}

// Sequências de dias de trabalho com a mesma atividade principal.
// Dias com motivo (sem trabalho na missão) não quebram a sequência.
export function sequencias(r) {
  const trabalhados = r.registros.filter((x) => x.atividade).sort((a, b) => a.dia.localeCompare(b.dia));
  const saida = [];
  for (const reg of trabalhados) {
    const ultima = saida.at(-1);
    if (ultima && ultima.chave === reg.atividade.trim().toLowerCase()) {
      ultima.fim = reg.dia;
      ultima.dias++;
      ultima.atividade = reg.atividade.trim();
    } else {
      saida.push({ chave: reg.atividade.trim().toLowerCase(), atividade: reg.atividade.trim(), inicio: reg.dia, fim: reg.dia, dias: 1 });
    }
  }
  return saida.map(({ chave, ...s }) => s);
}

// Sinais da missão. notifica = true quando o sinal cobra o próprio gestor.
export function sinais(g, r, hoje, feriados = []) {
  const sit = situacao(g, r);
  const saida = [];
  const ativa = ['em_execucao', 'impedida', 'em_ajuste'].includes(sit);

  if (ativa) {
    const impedidaTotal = impedimentosTotais(r).some((p) => !p.fechadaEm);
    const ultimo = r.registros.map((x) => x.dia).sort().at(-1) ?? g.emitidaEm;
    const ontem = paraTexto(new Date(paraData(hoje).getTime() - DIA));
    const semRegistro = diasUteis(ultimo, ontem, feriados);
    if (!impedidaTotal && semRegistro >= 2) {
      saida.push({ sinal: 'dias_sem_registro', detalhe: `${semRegistro} dias úteis`, notifica: false });
    }

    const { data } = dataExibida(g, r, hoje, feriados);
    const novaDataAberta = r.pendencias.some((p) => p.tipo === 'nova_data' && !p.fechadaEm);
    if (hoje > data && !novaDataAberta) {
      saida.push({ sinal: 'data_estimada_passou', detalhe: `era ${data.slice(8, 10)}/${data.slice(5, 7)}`, notifica: false });
    }

    for (const p of r.pendencias.filter((x) => !x.fechadaEm)) {
      const dias = diasUteis(p.abertaEm, hoje, feriados);
      const respondida = respostaDe(g, p);
      if (!respondida && dias >= (p.tipo === 'impedimento' ? 1 : 2)) {
        saida.push({ sinal: 'pendencia_sem_resposta', detalhe: `${p.tipo} sem resposta há ${dias} dias úteis`, notifica: true });
      }
      if (respondida && p.tipo === 'impedimento' && dias >= 3) {
        saida.push({ sinal: 'impedimento_aberto', detalhe: `respondido, mas aberto há ${dias} dias úteis`, notifica: true });
      }
    }
  }

  if (sit === 'entregue') {
    const dias = diasUteis(r.entregas.at(-1).em, hoje, feriados);
    if (dias > 2) saida.push({ sinal: 'espera_revisao', detalhe: `entregue há ${dias} dias úteis`, notifica: true });
  }
  return saida;
}

// Uma linha do painel do gestor.
export function linhaPainel(g, r, hoje, feriados = []) {
  const atual = sequencias(r).at(-1);
  const contar = (motivo) => r.registros.filter((x) => x.motivo === motivo).length;
  const { data, diasSuspensos } = dataExibida(g, r, hoje, feriados);
  return {
    id: g.id,
    titulo: g.titulo,
    responsavel: g.responsavel.nome,
    situacao: situacao(g, r),
    versao: g.versao,
    versaoNaoVista: g.versao > (r.vistoVersao ?? 0),
    dataEstimada: data,
    diasSuspensos,
    etapas: `${r.etapas.filter((e) => e.concluidaEm).length}/${r.etapas.length}`,
    ultimoRegistro: r.registros.map((x) => x.dia).sort().at(-1) ?? null,
    atividadeAtual: atual?.atividade ?? null,
    diasSeguidosNaAtividade: atual?.dias ?? 0,
    diasOutraMissao: contar('outra_missao'),
    diasForaDeMissao: contar('fora_de_missao'),
    sinais: sinais(g, r, hoje, feriados),
  };
}

// Linha do tempo para o gestor abrir antes de conversar.
export function linhaDoTempo(r) {
  return [...r.registros]
    .sort((a, b) => a.dia.localeCompare(b.dia))
    .map((x) => ({ dia: x.dia, texto: x.atividade ?? `sem trabalho: ${x.motivo}` }));
}
