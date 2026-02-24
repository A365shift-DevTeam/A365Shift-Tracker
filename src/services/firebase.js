import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

//  Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQ3tNueLhZDQv7Gr6--rTmR5aKj3CtbpA",
  authDomain: "a365shift-tracker-90f3e.firebaseapp.com",
  projectId: "a365shift-tracker-90f3e",
  storageBucket: "a365shift-tracker-90f3e.firebasestorage.app",
  messagingSenderId: "58984082448",
  appId: "1:58984082448:web:8e37a5212236e17bb6ee95"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
