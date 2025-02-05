/* firebase-messaging-sw.js */

// IMPORTANT: Do not use "import" here as service workers typically
// can’t handle ES module imports (unless you configure your bundler accordingly).

// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    apiKey: "AIzaSyAboaS9NaoGCUsbuZOP34dcuSLh77pZsvc",
    authDomain: "chat-webapp-6634b.firebaseapp.com",
    projectId: "chat-webapp-6634b",
    storageBucket: "chat-webapp-6634b.firebasestorage.app",
    messagingSenderId: "387272261368",
    appId: "1:387272261368:web:f856ed7a25e16c3c6e450d",
    measurementId: "G-T04XGN1YWG"
})

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message: ', payload)

    const notificationTitle = payload.notification?.title || 'Background Title'
    const notificationOptions = {
        body: payload.notification?.body || 'Background Body',
        // icon: '/img/icons/android-chrome-192x192.png', // or any icon you want
    }

    // Show the notification
    self.registration.showNotification(notificationTitle, notificationOptions)
})
