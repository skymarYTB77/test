import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDZPiPiNE5zGmqH7SSxWz5RP4IZvGhqQWY",
  authDomain: "petit-bac-game.firebaseapp.com",
  projectId: "petit-bac-game",
  storageBucket: "petit-bac-game.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);