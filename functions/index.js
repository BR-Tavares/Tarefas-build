// Cloud Functions (southamerica-east1) — Seção 10 da especificação
// - Gatilhos por evento:
//   1. Missão emitida -> avisa o Responsável
//   2. Resposta ou alteração -> avisa o Responsável
//   3. Primeiro plano salvo (primeiroPlanoEm) -> avisa o Gestor (aviso único)
//   4. Pendência aberta -> avisa o Gestor
//   5. Entrega feita -> avisa o Gestor
// - Função agendada (8h às 18h em dias úteis, America/Sao_Paulo):
//   6. Roda analise.js e avisa o Gestor uma única vez por sinal que notifica.
//   O responsável NUNCA recebe notificação de sinal.

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import {
  onDocumentWritten,
  onDocumentCreated,
} from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { sinais } from './analise.js';

initializeApp();
const db = getFirestore();

const REGIAO = 'southamerica-east1';

function hojeSP() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const y = partes.find((p) => p.type === 'year').value;
  const m = partes.find((p) => p.type === 'month').value;
  const d = partes.find((p) => p.type === 'day').value;
  return `${y}-${m}-${d}`;
}

async function enviarParaTokens(tokens, title, body, data = {}) {
  const validos = tokens.filter(Boolean);
  if (validos.length === 0) return;
  try {
    await getMessaging().sendEachForMulticast({
      tokens: validos,
      notification: { title, body },
      data,
    });
  } catch (err) {
    console.error('Erro ao enviar FCM:', err);
  }
}

async function obterTokensPorEmail(equipeId, email) {
  if (!email) return [];
  const snap = await db
    .collection(`equipes/${equipeId}/tokens`)
    .where('email', '==', email.toLowerCase())
    .get();
  return snap.docs.map((d) => d.data().token).filter(Boolean);
}

async function obterTokensDoGestor(equipeId) {
  const eqSnap = await db.doc(`equipes/${equipeId}`).get();
  if (!eqSnap.exists) return [];
  const { gestorUid, gestorEmail } = eqSnap.data();
  const tokens = new Set();

  if (gestorUid) {
    const tDoc = await db.doc(`equipes/${equipeId}/tokens/${gestorUid}`).get();
    if (tDoc.exists && tDoc.data().token) tokens.add(tDoc.data().token);
  }
  if (gestorEmail) {
    const porEmail = await obterTokensPorEmail(equipeId, gestorEmail);
    porEmail.forEach((t) => tokens.add(t));
  }
  return [...tokens];
}

// 1. Missão emitida -> avisa o Responsável
export const aoEmitirMissao = onDocumentWritten(
  {
    document: 'equipes/{equipeId}/missoes/{missaoId}',
    region: REGIAO,
  },
  async (event) => {
    const antes = event.data?.before?.data();
    const depois = event.data?.after?.data();
    if (!depois) return;

    const acabouDeEmitir = !antes?.emitidaEm && Boolean(depois.emitidaEm);
    if (!acabouDeEmitir) return;

    const { equipeId, missaoId } = event.params;
    const tokens = await obterTokensPorEmail(equipeId, depois.responsavelEmail);
    await enviarParaTokens(
      tokens,
      `Nova missão ${depois.codigo || missaoId}`,
      `${depois.titulo} — escreva as etapas iniciais na folha.`,
      { equipeId, missaoId, evento: 'missao_emitida' }
    );
  }
);

// 2. Resposta ou alteração feita -> avisa o Responsável
export const aoResponderPendencia = onDocumentWritten(
  {
    document: 'equipes/{equipeId}/missoes/{missaoId}/respostas/{pendenciaId}',
    region: REGIAO,
  },
  async (event) => {
    const depois = event.data?.after?.data();
    if (!depois) return;

    const { equipeId, missaoId, pendenciaId } = event.params;
    const mSnap = await db.doc(`equipes/${equipeId}/missoes/${missaoId}`).get();
    if (!mSnap.exists) return;
    const m = mSnap.data();

    const tokens = await obterTokensPorEmail(equipeId, m.responsavelEmail);
    const rotulo =
      depois.tipo === 'alteracao'
        ? `Alteração na missão ${m.codigo || missaoId} (v${m.versao})`
        : `Resposta na missão ${m.codigo || missaoId}`;
    await enviarParaTokens(tokens, rotulo, depois.texto || 'Abra a folha para conferir.', {
      equipeId,
      missaoId,
      pendenciaId,
      evento: 'resposta_gestor',
    });
  }
);

// 3. Primeiro plano salvo -> avisa o Gestor (aviso único)
export const aoSalvarPrimeiroPlano = onDocumentWritten(
  {
    document: 'equipes/{equipeId}/missoes/{missaoId}/responsavel/estado',
    region: REGIAO,
  },
  async (event) => {
    const antes = event.data?.before?.data();
    const depois = event.data?.after?.data();
    if (!depois) return;

    const salvouPrimeiroPlanoAgora =
      !antes?.primeiroPlanoEm &&
      Boolean(depois.primeiroPlanoEm) &&
      Array.isArray(depois.etapas) &&
      depois.etapas.length > 0;
    if (!salvouPrimeiroPlanoAgora) return;

    const { equipeId, missaoId } = event.params;
    const mSnap = await db.doc(`equipes/${equipeId}/missoes/${missaoId}`).get();
    if (!mSnap.exists) return;
    const m = mSnap.data();

    const tokens = await obterTokensDoGestor(equipeId);
    await enviarParaTokens(
      tokens,
      `Primeiro plano salvo — ${m.codigo || missaoId}`,
      `${m.titulo}: ${depois.etapas.length} etapas definidas pelo responsável.`,
      { equipeId, missaoId, evento: 'primeiro_plano' }
    );
  }
);

// 4. Pendência aberta -> avisa o Gestor
export const aoAbrirPendencia = onDocumentCreated(
  {
    document: 'equipes/{equipeId}/missoes/{missaoId}/pendencias/{pendenciaId}',
    region: REGIAO,
  },
  async (event) => {
    const p = event.data?.data();
    if (!p) return;

    const { equipeId, missaoId, pendenciaId } = event.params;
    const mSnap = await db.doc(`equipes/${equipeId}/missoes/${missaoId}`).get();
    if (!mSnap.exists) return;
    const m = mSnap.data();

    const tokens = await obterTokensDoGestor(equipeId);
    await enviarParaTokens(
      tokens,
      `Pendência (${p.tipo}) — ${m.codigo || missaoId}`,
      p.texto || 'Nova pendência aberta na folha.',
      { equipeId, missaoId, pendenciaId, evento: 'pendencia_aberta' }
    );
  }
);

// 5. Entrega feita -> avisa o Gestor
export const aoFazerEntrega = onDocumentCreated(
  {
    document: 'equipes/{equipeId}/missoes/{missaoId}/entregas/{entregaId}',
    region: REGIAO,
  },
  async (event) => {
    const ent = event.data?.data();
    if (!ent) return;

    const { equipeId, missaoId, entregaId } = event.params;
    const mSnap = await db.doc(`equipes/${equipeId}/missoes/${missaoId}`).get();
    if (!mSnap.exists) return;
    const m = mSnap.data();

    const tokens = await obterTokensDoGestor(equipeId);
    await enviarParaTokens(
      tokens,
      `Entrega registrada — ${m.codigo || missaoId}`,
      `${m.titulo}: pronta para revisão do gestor.`,
      { equipeId, missaoId, entregaId, evento: 'entrega_feita' }
    );
  }
);

// 6. Função agendada de hora em hora (8h às 18h nos dias úteis) para sinais que notificam o gestor
export const verificarSinaisAgendado = onSchedule(
  {
    schedule: '0 8-18 * * 1-5',
    timeZone: 'America/Sao_Paulo',
    region: REGIAO,
  },
  async () => {
    const hoje = hojeSP();
    const equipesSnap = await db.collection('equipes').get();

    for (const eqDoc of equipesSnap.docs) {
      const equipeId = eqDoc.id;
      const feriados = eqDoc.data().feriados || [];
      if (feriados.includes(hoje)) continue;

      const tokensGestor = await obterTokensDoGestor(equipeId);
      if (tokensGestor.length === 0) continue;

      const missoesSnap = await db.collection(`equipes/${equipeId}/missoes`).get();
      for (const mDoc of missoesSnap.docs) {
        const missaoId = mDoc.id;
        const m = mDoc.data();
        if (!m.emitidaEm || m.cancelada || m.concluidaEm) continue;

        const [respostasSnap, revisoesSnap, estadoSnap, registrosSnap, pendenciasSnap, entregasSnap] =
          await Promise.all([
            db.collection(`equipes/${equipeId}/missoes/${missaoId}/respostas`).get(),
            db.collection(`equipes/${equipeId}/missoes/${missaoId}/revisoes`).get(),
            db.doc(`equipes/${equipeId}/missoes/${missaoId}/responsavel/estado`).get(),
            db.collection(`equipes/${equipeId}/missoes/${missaoId}/registros`).get(),
            db.collection(`equipes/${equipeId}/missoes/${missaoId}/pendencias`).get(),
            db.collection(`equipes/${equipeId}/missoes/${missaoId}/entregas`).get(),
          ]);

        const g = {
          id: m.codigo || missaoId,
          titulo: m.titulo || '',
          responsavel: { nome: m.responsavelEmail || '' },
          emitidaEm: m.emitidaEm,
          dataEstimada: m.dataEstimada,
          versao: m.versao ?? 1,
          cancelada: m.cancelada || null,
          respostas: respostasSnap.docs.map((d) => ({ pendenciaId: d.id, ...d.data() })),
          revisoes: revisoesSnap.docs.map((d) => ({ entregaId: d.id, ...d.data() })),
        };

        const est = estadoSnap.exists ? estadoSnap.data() : {};
        const r = {
          vistoVersao: est.vistoVersao ?? 0,
          etapas: est.etapas || [],
          registros: registrosSnap.docs.map((d) => ({ dia: d.id, ...d.data() })),
          pendencias: pendenciasSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          entregas: entregasSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        };

        const listaSinais = sinais(g, r, hoje, feriados).filter((s) => s.notifica === true);
        for (const s of listaSinais) {
          // Avisa uma única vez por sinal/causa
          const chaveSinal = `${equipeId}_${missaoId}_${s.sinal}`;
          const controleRef = db.doc(`_controle_notificacoes/${chaveSinal}`);
          const controleSnap = await controleRef.get();
          if (controleSnap.exists) continue;

          await enviarParaTokens(
            tokensGestor,
            `Sinal na missão ${g.id}`,
            `${g.titulo}: ${s.detalhe}`,
            { equipeId, missaoId, sinal: s.sinal }
          );
          await controleRef.set({
            enviadoEm: new Date().toISOString(),
            hoje,
            sinal: s.sinal,
            detalhe: s.detalhe,
          });
        }
      }
    }
  }
);
