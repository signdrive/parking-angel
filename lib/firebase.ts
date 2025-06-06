// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics, type Analytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
import { getMessaging, type Messaging } from "firebase/messaging"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBRgsiqNxAUWHn-fZgGRDySkwf-_tkf1W8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "parking-angel-224eb.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "parking-angel-224eb",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "parking-angel-224eb.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "74167164461",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:74167164461:web:9d24ad91f8ca36cb18e2a4",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-3YEK21QMR9",
}

// Validate Firebase configuration
const isFirebaseConfigured = () => {
  const requiredFields = [
    firebaseConfig.apiKey,
    firebaseConfig.authDomain,
    firebaseConfig.projectId,
    firebaseConfig.storageBucket,
    firebaseConfig.messagingSenderId,
    firebaseConfig.appId,
  ]

  return requiredFields.every((field) => field && field !== "")
}

// Initialize Firebase only if properly configured
let app: any = null
let analytics: Analytics | null = null
let messaging: Messaging | null = null
let db: any = null
let storage: any = null
let auth: any = null

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig)

    // Initialize Firebase services
    db = getFirestore(app)
    storage = getStorage(app)
    auth = getAuth(app)

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

    console.log("Firebase initialized successfully")
  } catch (error) {
    console.error("Firebase initialization failed:", error)
  }
} else {
  console.warn("Firebase not configured - missing environment variables")
}

// Export Firebase services
export { app, analytics, messaging, db, storage, auth }

// Helper function to check if Firebase is available
export const isFirebaseAvailable = () => {
  return isFirebaseConfigured() && app !== null
}

// Export configuration status
export { isFirebaseConfigured }
