
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyDFR44IK6FSl-N8zyrJOOi532C6133Un_Q",
  authDomain: "rk-delta.firebaseapp.com",
  projectId: "rk-delta",
  storageBucket: "rk-delta.firebasestorage.app",
  messagingSenderId: "428932858018",
  appId: "1:428932858018:web:8ccca497cccfe186d117fb",
  measurementId: "G-ZRC6SHW6KN",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification?.title || "New Notification";

  const notificationOptions = {
    body: payload.notification?.body,
    icon: "/assets/icons/icon-192x192.png",
    image: payload.notification?.image,
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const clickUrl = event.notification.data.clickUrl;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(clickUrl) && "focus" in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(clickUrl);
        }
      }),
  );
});
