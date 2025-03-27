importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAs6zkFlX6Ff_Y6yPzUeHGTTN0QsDhE21w",
    authDomain: "grassroots-football-management.firebaseapp.com",
    projectId: "grassroots-football-management",
    storageBucket: "grassroots-football-management.appspot.com",
    messagingSenderId: "180320540339",
    appId: "1:180320540339:web:a3df1d6f0e635f7db382c6",
    measurementId: "G-Y1EZ17VLVW",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      data: payload.data, // includes trainingId, etc.
      icon: '/logo192.png' // optional: app icon
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
  