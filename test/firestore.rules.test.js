import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

let testEnv;

const EQUIPE_ID = 'principal';
const GESTOR = { uid: 'uid-gestor', email: 'gestor@equipe.com' };
const RESP_1 = { uid: 'uid-resp1', email: 'marina@equipe.com' };
const RESP_2 = { uid: 'uid-resp2', email: 'carlos@equipe.com' };
const FORA = { uid: 'uid-fora', email: 'intruso@fora.com' };

function ctx(user) {
  return testEnv.authenticatedContext(user.uid, {
    email: user.email,
    email_verified: true,
  });
}

describe('firestore.rules — Critérios de Aceite 1, 6, 12, 13 e Regras de Segurança (Seção 5)', () => {
  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'tarefas-build-test',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      },
    });
  });

  after(async () => {
    if (testEnv) await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      const db = adminCtx.firestore();
      await setDoc(doc(db, 'equipes', EQUIPE_ID), {
        nome: 'Equipe P&D',
        gestorUid: GESTOR.uid,
        gestorEmail: GESTOR.email,
        proximoNumero: 28,
        feriados: ['2026-11-02'],
      });
      await setDoc(doc(db, 'equipes', EQUIPE_ID, 'membros', RESP_1.email), {
        nome: 'Marina',
        email: RESP_1.email,
        papel: 'responsavel',
        ativo: true,
      });
      await setDoc(doc(db, 'equipes', EQUIPE_ID, 'membros', RESP_2.email), {
        nome: 'Carlos',
        email: RESP_2.email,
        papel: 'responsavel',
        ativo: true,
      });
      await setDoc(doc(db, 'equipes', EQUIPE_ID, 'missoes', 'MS-027'), {
        codigo: 'MS-027',
        titulo: 'Calibrar sensor de umidade em solo argiloso',
        gestorUid: GESTOR.uid,
        responsavelEmail: RESP_1.email,
        emitidaEm: '2026-10-19',
        dataEstimada: '2026-10-28',
        versao: 1,
        cancelada: null,
        concluidaEm: null,
      });
      await setDoc(doc(db, 'equipes', EQUIPE_ID, 'missoes', 'MS-028-RASCUNHO'), {
        codigo: 'MS-028',
        titulo: 'Rascunho de missão',
        gestorUid: GESTOR.uid,
        responsavelEmail: RESP_1.email,
        emitidaEm: null,
        dataEstimada: '2026-11-10',
        versao: 1,
        cancelada: null,
      });
    });
  });

  it('Critério 12 e 13: Bloqueia alguém de fora da equipe de ler qualquer documento', async () => {
    const dbFora = ctx(FORA).firestore();
    await assertFails(getDoc(doc(dbFora, 'equipes', EQUIPE_ID)));
    await assertFails(getDoc(doc(dbFora, 'equipes', EQUIPE_ID, 'membros', RESP_1.email)));
    await assertFails(getDoc(doc(dbFora, 'equipes', EQUIPE_ID, 'missoes', 'MS-027')));
  });

  it('Critério 1 e 13: Bloqueia um responsável de ler a missão de outro responsável, a lista geral ou rascunho não emitido', async () => {
    const dbResp2 = ctx(RESP_2).firestore();
    await assertFails(getDoc(doc(dbResp2, 'equipes', EQUIPE_ID, 'missoes', 'MS-027')));
    await assertFails(getDocs(collection(dbResp2, 'equipes', EQUIPE_ID, 'missoes')));

    const dbResp1 = ctx(RESP_1).firestore();
    await assertSucceeds(getDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-027')));
    await assertFails(getDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-028-RASCUNHO')));
    await assertSucceeds(
      getDocs(
        query(
          collection(dbResp1, 'equipes', EQUIPE_ID, 'missoes'),
          where('responsavelEmail', '==', RESP_1.email),
          where('emitidaEm', '!=', null)
        )
      )
    );
  });

  it('Critério 13: Bloqueia o responsável de gravar no que é do gestor (missão, respostas, alterações, revisões, equipe)', async () => {
    const dbResp1 = ctx(RESP_1).firestore();
    await assertFails(
      setDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-027'), { titulo: 'Alterado' }, { merge: true })
    );
    await assertFails(
      setDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'respostas', 'p1'), {
        em: '2026-10-22',
        tipo: 'resposta',
        texto: 'Tentativa inválida',
      })
    );
    await assertFails(
      setDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'revisoes', 'e1'), {
        em: '2026-10-28',
        resultado: 'concluida',
        produto: 'atende',
      })
    );
  });

  it('Critério 6 e 13: Bloqueia o gestor de gravar registro do dia, etapas, pendências (inclusive fechar) ou entregas do responsável', async () => {
    const dbGestor = ctx(GESTOR).firestore();
    const dbResp1 = ctx(RESP_1).firestore();

    // Responsável abre pendência
    await assertSucceeds(
      setDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'pendencias', 'p1'), {
        tipo: 'duvida',
        bloqueio: 'nenhum',
        texto: 'Dúvida na folha',
        abertaEm: '2026-10-20',
        fechadaEm: null,
      })
    );

    // Gestor tenta fechar a pendência -> BLOQUEADO (Critério 6: quem abre, fecha)
    await assertFails(
      updateDoc(doc(dbGestor, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'pendencias', 'p1'), {
        fechadaEm: '2026-10-21',
      })
    );

    // Responsável que abriu consegue fechar a pendência
    await assertSucceeds(
      updateDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'pendencias', 'p1'), {
        fechadaEm: '2026-10-21',
      })
    );

    // Gestor bloqueado de gravar registros e estado do responsável
    await assertFails(
      setDoc(doc(dbGestor, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'registros', '2026-10-20'), {
        atividade: 'secar amostras n1',
      })
    );
    await assertFails(
      setDoc(doc(dbGestor, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'responsavel', 'estado'), {
        vistoVersao: 1,
        etapas: [],
      })
    );
  });

  it('Valida registros do dia: aceita atividade (<=80 chars, sem espaços nas pontas) OU motivo, nunca os dois', async () => {
    const dbResp1 = ctx(RESP_1).firestore();
    await assertSucceeds(
      setDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'registros', '2026-10-20'), {
        atividade: 'secar amostras n1',
      })
    );
    await assertSucceeds(
      setDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'registros', '2026-10-21'), {
        motivo: 'outra_missao',
      })
    );
    await assertFails(
      setDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'registros', '2026-10-22'), {
        atividade: 'secar amostras n1',
        motivo: 'outra_missao',
      })
    );
    await assertFails(
      setDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'registros', '2026-10-22'), {
        atividade: ' secar amostras n1 ',
      })
    );
    await assertFails(
      setDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'registros', '2026-10-22'), {
        atividade: 'a'.repeat(81),
      })
    );
  });

  it('Ninguém apaga documentos, exceto o gestor ao apagar um rascunho não emitido', async () => {
    const dbGestor = ctx(GESTOR).firestore();
    const dbResp1 = ctx(RESP_1).firestore();

    await assertFails(deleteDoc(doc(dbGestor, 'equipes', EQUIPE_ID, 'missoes', 'MS-027')));
    await assertSucceeds(deleteDoc(doc(dbGestor, 'equipes', EQUIPE_ID, 'missoes', 'MS-028-RASCUNHO')));
    await assertFails(deleteDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-027')));
  });

  it('Critério A4 (planos): responsável grava plano, gestor lê, mas responsável não lê planos', async () => {
    const dbResp1 = ctx(RESP_1).firestore();
    const dbGestor = ctx(GESTOR).firestore();

    // Responsável grava plano válido
    await assertSucceeds(
      setDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'planos', 'plano-1'), {
        em: '2026-10-20',
        versaoMissao: 1,
        etapas: ['Etapa A', 'Etapa B'],
      })
    );

    // Gestor consegue ler
    await assertSucceeds(
      getDoc(doc(dbGestor, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'planos', 'plano-1'))
    );

    // Responsável NÃO tem permissão de leitura em planos
    await assertFails(
      getDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'planos', 'plano-1'))
    );
  });

  it('Critério A9 (entregas): responsável cria entrega com link e pode corrigir a mesma entrega via update', async () => {
    const dbResp1 = ctx(RESP_1).firestore();

    // Cria entrega com link válido
    await assertSucceeds(
      setDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'entregas', 'ent-1'), {
        em: '2026-10-22',
        link: 'https://docs.google.com/planilha-1',
        criterios: [{ criterioId: 'cr-1', condicao: 'Cond 1', status: 'atendido' }],
      })
    );

    // Rejeita criação com link vazio
    await assertFails(
      setDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'entregas', 'ent-invalida'), {
        em: '2026-10-22',
        link: '',
      })
    );

    // Corrigir entrega atualiza o mesmo documento (update)
    await assertSucceeds(
      updateDoc(doc(dbResp1, 'equipes', EQUIPE_ID, 'missoes', 'MS-027', 'entregas', 'ent-1'), {
        link: 'https://docs.google.com/planilha-1-corrigida',
        corrigidaEm: '2026-10-23',
      })
    );
  });
});
