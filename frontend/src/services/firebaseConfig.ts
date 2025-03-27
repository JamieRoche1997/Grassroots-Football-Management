import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAs6zkFlX6Ff_Y6yPzUeHGTTN0QsDhE21w",
  authDomain: "grassroots-football-management.firebaseapp.com",
  projectId: "grassroots-football-management",
  storageBucket: "grassroots-football-management.appspot.com",
  messagingSenderId: "180320540339",
  appId: "1:180320540339:web:a3df1d6f0e635f7db382c6",
  measurementId: "G-Y1EZ17VLVW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);

// Messaging (FCM)
export const messaging = getMessaging(app);

// Request notification permission and get token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: "BIr3C03TtOqREssbKTPzNE8EYXdsNBNzSmGQzX65RfQrnrJRozU1bo7spWQU34P8Ha5bQh_ROaX_B9jZ21xO_80",
      });

      return token;
    } else {
      console.log("Notification permission denied.");
    }
  } catch (error) {
    console.error("FCM permission error:", error);
  }

  return null;
};