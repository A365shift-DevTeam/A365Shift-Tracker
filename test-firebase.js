import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQ3tNueLhZDQv7Gr6--rTmR5aKj3CtbpA",
  authDomain: "a365shift-tracker-90f3e.firebaseapp.com",
  projectId: "a365shift-tracker-90f3e",
  storageBucket: "a365shift-tracker-90f3e.firebasestorage.app",
  messagingSenderId: "58984082448",
  appId: "1:58984082448:web:8e37a5212236e17bb6ee95"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebase() {
  try {
    console.log("Connecting to Firebase...");
    const snapshot = await getDocs(collection(db, "contacts"));
    console.log("Success! Contacts count:", snapshot.docs.length);
  } catch (error) {
    console.error("Firebase Error:");
    console.error(error);
  }
}

testFirebase();
