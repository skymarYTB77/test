import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCof6x4nXK1rKaTKAnyETLz9Ej33g_CL0c",
  authDomain: "gestionnaire-de-fiches.firebaseapp.com",
  projectId: "gestionnaire-de-fiches",
  storageBucket: "gestionnaire-de-fiches.firebasestorage.app",
  messagingSenderId: "323939368833",
  appId: "1:323939368833:web:8057d0134d6a24f207f280",
  measurementId: "G-WD6VHT0R8X"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);