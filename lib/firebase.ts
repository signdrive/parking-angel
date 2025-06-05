// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics, type Analytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
import { getMessaging, type Messaging } from "firebase/messaging"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRgsiqNxAUWHn-fZgGRDySkwf-_tkf1W8",
  authDomain: "parking-angel-224eb.firebaseapp.com",
  projectId: "parking-angel-224eb",
  storageBucket: "parking-angel-224eb.firebasestorage.app",
  messagingSenderId: "74167164461",
  appId: "1:74167164461:web:9d24ad91f8ca36cb18e2a4",
  measurementId: "G-3YEK21QMR9",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
let analytics: Analytics | null = null
let messaging: Messaging | null = null

// Initialize analytics only on client side
if (typeof window !== "undefined") {
  analytics = getAnalytics(app)
}

// Initialize messaging only on client side and if supported
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  try {
    messaging = getMessaging(app)
  } catch (error) {
    console.log("Firebase messaging not supported:", error)
  }
}

// Initialize other services
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)

// Export analytics and messaging with null checks
export { analytics, messaging }
export { app }

// Helper function to check if Firebase is available
export const isFirebaseAvailable = () => {
  return typeof window !== "undefined"
}
