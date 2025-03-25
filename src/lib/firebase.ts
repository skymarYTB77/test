import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAb5UvlPq7jIV_9FsdH8QdkjqkI56UpLy8",
  authDomain: "createur-d-icone-de-dossier.firebaseapp.com",
  projectId: "createur-d-icone-de-dossier",
  storageBucket: "createur-d-icone-de-dossier.appspot.com",
  messagingSenderId: "847614369030",
  appId: "1:847614369030:web:YOUR_APP_ID"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);