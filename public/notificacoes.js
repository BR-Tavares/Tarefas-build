// Módulo de notificações (Firebase Cloud Messaging) — Seção 10 da especificação.
// Pede permissão na primeira vez com uma frase explicando para que serve
// e grava o token em equipes/{equipeId}/tokens/{uid}.

import { app, db, doc, setDoc } from './firebase-config.js';
import { mostrarAviso } from './dom.js';

export async function registrarTokenNotificacao(equipeId, usuario, papel) {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    mostrarAviso('Este navegador não suporta notificações push.', 'info');
    return false;
  }

  try {
    const permissao = await Notification.requestPermission();
    if (permissao !== 'granted') {
      mostrarAviso('Permissão de notificação não concedida.', 'info');
      return false;
    }

    const { getMessaging, getToken, onMessage, isSupported } = await import(
      'https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js'
    );

    if (!(await isSupported())) {
      return false;
    }

    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      serviceWorkerRegistration: swReg,
    });

    if (token) {
      await setDoc(
        doc(db, 'equipes', equipeId, 'tokens', usuario.uid),
        {
          uid: usuario.uid,
          email: (usuario.email || '').toLowerCase(),
          papel,
          token,
          atualizadoEm: new Date().toISOString(),
        },
        { merge: true }
      );

      onMessage(messaging, (payload) => {
        const titulo = payload.notification?.title || 'Missões';
        const corpo = payload.notification?.body || '';
        mostrarAviso(`${titulo}: ${corpo}`, 'info');
      });

      mostrarAviso('Notificações ativadas neste aparelho.', 'sucesso');
      return true;
    }
  } catch (err) {
    // Em navegadores sem VAPID configurado ou modo privado, registra intenção do usuário
    await setDoc(
      doc(db, 'equipes', equipeId, 'tokens', usuario.uid),
      {
        uid: usuario.uid,
        email: (usuario.email || '').toLowerCase(),
        papel,
        permissaoNavegador: Notification.permission,
        atualizadoEm: new Date().toISOString(),
      },
      { merge: true }
    ).catch(() => {});
  }
  return false;
}
