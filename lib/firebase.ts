import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAzsjC8yn3FfKrCTOU_9UAkN9Leh8rIC7E",
  authDomain: "crowdvision-ai-7e13f.firebaseapp.com",
  projectId: "crowdvision-ai-7e13f",
  storageBucket: "crowdvision-ai-7e13f.firebasestorage.app",
  messagingSenderId: "1030038224372",
  appId: "1:1030038224372:web:aebdf076e33a1447ad4da1",
  measurementId: "G-CX55SM3ZCR"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Analytics only on client side
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, db, auth, analytics };
