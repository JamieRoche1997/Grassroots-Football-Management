import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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