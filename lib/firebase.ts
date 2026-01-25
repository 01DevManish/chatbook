import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDZtRV7ZgsgrhwnjntaNAf0dqBUEmYtQgE",
    authDomain: "preploner.firebaseapp.com",
    projectId: "preploner",
    storageBucket: "preploner.firebasestorage.app",
    messagingSenderId: "104475352938",
    appId: "1:104475352938:web:5e0a7376605bc5a0d08f13",
    measurementId: "G-KFK5JLGWEB",
    databaseURL: "https://preploner-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app); // Realtime Database
const googleProvider = new GoogleAuthProvider();

let analytics;
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { auth, db, rtdb, analytics, googleProvider };
