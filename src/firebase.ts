import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB--8OpttEdDe3okIMgqs7BaVSE1pdzwrs",
  authDomain: "petit-bac-3ec1c.firebaseapp.com",
  databaseURL: "https://petit-bac-3ec1c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "petit-bac-3ec1c",
  storageBucket: "petit-bac-3ec1c.appspot.com",
  messagingSenderId: "981068655131",
  appId: "1:981068655131:web:abc123def456ghi789jkl"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);