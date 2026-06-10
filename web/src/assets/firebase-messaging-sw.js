importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDFR44IK6FSl-N8zyrJOOi532C6133Un_Q",
  authDomain: "rk-delta.firebaseapp.com",
  projectId: "rk-delta",
  storageBucket: "rk-delta.firebasestorage.app",
  messagingSenderId: "428932858018",
  appId: "1:428932858018:web:8ccca497cccfe186d117fb",
  measurementId: "G-ZRC6SHW6KN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve messaging instance
const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/assets/icons/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
