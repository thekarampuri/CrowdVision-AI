import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyAzsjC8yn3FfKrCTOU_9UAkN9Leh8rIC7E",
  authDomain: "crowdvision-ai-7e13f.firebaseapp.com",
  projectId: "crowdvision-ai-7e13f",
  storageBucket: "crowdvision-ai-7e13f.firebasestorage.app",
  messagingSenderId: "1030038224372",
  appId: "1:1030038224372:web:aebdf076e33a1447ad4da1",
  measurementId: "G-CX55SM3ZCR",
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)

// Initialize Analytics only on client side
let analytics: any = null
if (typeof window !== "undefined") {
  analytics = getAnalytics(app)
}

export { app, auth, analytics }
