import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB--8OpttEdDe3okIMgqs7BaVSE1pdzwrs",
  authDomain: "petit-bac-3ec1c.firebaseapp.com",
  projectId: "petit-bac-3ec1c",
  storageBucket: "petit-bac-3ec1c.appspot.com",
  messagingSenderId: "981068655131",
  appId: "1:981068655131:web:abc123def456ghi789jkl"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);