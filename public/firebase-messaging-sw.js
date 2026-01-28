// Firebase Cloud Messaging Service Worker
// This runs in the background to show notifications when the app is closed

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDZtRV7ZgsgrhwnjntaNAf0dqBUEmYtQgE",
    authDomain: "preploner.firebaseapp.com",
    projectId: "preploner",
    storageBucket: "preploner.firebasestorage.app",
    messagingSenderId: "104475352938",
    appId: "1:104475352938:web:5e0a7376605bc5a0d08f13",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || 'New Message';
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || 'You have a new message',
        icon: '/logo.png',
        badge: '/logo.png',
        tag: payload.data?.chatId || 'chatbook-notification',
        data: payload.data,
        vibrate: [200, 100, 200],
        requireInteraction: true,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);
    event.notification.close();

    // Open the app when notification is clicked
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If app is already open, focus it
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
