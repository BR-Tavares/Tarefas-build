// Service Worker para Firebase Cloud Messaging (FCM) em segundo plano

importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js');

firebase.initializeApp({
  projectId: 'tarefas-build',
  appId: '1:455008043199:web:89b423e4e4f89bf885460a',
  storageBucket: 'tarefas-build.firebasestorage.app',
  apiKey: 'AIzaSyCTVM3jUuzU_F0Cs_VvjmHr6KWoYO9CeR8',
  authDomain: 'tarefas-build.firebaseapp.com',
  messagingSenderId: '455008043199',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Missões';
  const options = {
    body: payload.notification?.body || '',
    icon: '/icon.svg',
    badge: '/icon.svg',
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
