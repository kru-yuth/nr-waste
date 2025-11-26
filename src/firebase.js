import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project configuration
// You can find this in your Firebase Console -> Project Settings
const firebaseConfig = {
    apiKey: "AIzaSyBMSOXfZ6ekotGtlI7yCjwancqog_Vqdes",
    authDomain: "nr-nexus.firebaseapp.com",
    databaseURL: "https://nr-nexus-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nr-nexus",
    storageBucket: "nr-nexus.firebasestorage.app",
    messagingSenderId: "491627935178",
    appId: "1:491627935178:web:c5ca296b2c825d6ce60b33",
    measurementId: "G-DKNM9P2EN1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
