/* firebase-messaging-sw.js */

// IMPORTANT: Do not use "import" here as service workers typically
// can’t handle ES module imports (unless you configure your bundler accordingly).

// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    apiKey: '<your-api-key>',
    authDomain: '<your-auth-domain>',
    projectId: '<your-project-id>',
    storageBucket: '<your-storage-bucket>',
    messagingSenderId: '<your-sender-id>',
    appId: '<your-app-id>',
    measurementId: '<your-measurement-id>'
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
