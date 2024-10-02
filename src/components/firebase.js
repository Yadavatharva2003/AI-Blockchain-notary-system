// firebase.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDK3KAuL2WJyb1XikrfFKGfHvIKp0TuOA8",
  authDomain: "notary-e69a1.firebaseapp.com",
  projectId: "notary-e69a1",
  storageBucket: "notary-e69a1.appspot.com",
  messagingSenderId: "687081105819",
  appId: "1:687081105819:web:859ad75faee7c46110593e",
  measurementId: "G-5QNN8EVG9L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
