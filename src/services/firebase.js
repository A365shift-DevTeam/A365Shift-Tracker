import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

//  Firebase configuration
const firebaseConfig = {
 apiKey: "AIzaSyBE-g2hdEPgpTCA1hOjb2ey5pAoXnDptpY",
  authDomain: "digital-board-e80cb.firebaseapp.com",
  projectId: "digital-board-e80cb",
  storageBucket: "digital-board-e80cb.firebasestorage.app",
  messagingSenderId: "580596376504",
  appId: "1:580596376504:web:87cd9dd41faabeaf10a54d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
