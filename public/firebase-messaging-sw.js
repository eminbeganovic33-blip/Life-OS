// Firebase Cloud Messaging service worker.
//
// Registered by src/utils/fcm.js with Firebase config passed via URL query
// params (Vite env vars aren't available inside a service worker at runtime).
// Responsibilities:
// - Receive background push payloads from FCM
// - Render a Notification for each payload
// - Focus/open the app on notification click

/* eslint-disable no-restricted-globals */
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Parse config from our own registration URL
const params = new URL(self.location).searchParams;
const firebaseConfig = {
  apiKey: params.get("apiKey"),
  authDomain: params.get("authDomain"),
  projectId: params.get("projectId"),
  storageBucket: params.get("storageBucket"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
};

// Guard against missing config — without apiKey initializeApp throws
if (firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || "Life OS";
    const options = {
      body: payload.notification?.body || "",
      icon: payload.notification?.icon || "/favicon.svg",
      badge: "/favicon.svg",
      // Preserve any custom routing data so notificationclick can deep-link
      data: payload.data || {},
      tag: payload.data?.tag || "life-os-notification",
    };
    self.registration.showNotification(title, options);
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification?.data?.url || "/";
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });
    // Focus an existing tab if possible
    for (const client of allClients) {
      if (client.url.includes(self.location.origin) && "focus" in client) {
        client.navigate?.(target).catch(() => {});
        return client.focus();
      }
    }
    // Otherwise open a new tab
    if (self.clients.openWindow) {
      return self.clients.openWindow(target);
    }
  })());
});
