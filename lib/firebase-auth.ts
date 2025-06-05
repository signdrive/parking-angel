import { auth } from "./firebase"
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "./firebase"
import { trackUserUpgrade, setUserAnalyticsProperties } from "./firebase-analytics"

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.addScope("email")
googleProvider.addScope("profile")

// Sign in with Google using Firebase Auth
export const signInWithGoogleFirebase = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user

    // Create or update user profile in Firestore
    await createOrUpdateUserProfile(user)

    // Track analytics
    setUserAnalyticsProperties(user.uid, {
      signup_method: "google",
      user_type: "authenticated",
      provider: "firebase",
    })

    return { user, error: null }
  } catch (error: any) {
    console.error("Google sign-in error:", error)
    return { user: null, error }
  }
}

// Sign in with email and password
export const signInWithEmailFirebase = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const user = result.user

    // Track analytics
    setUserAnalyticsProperties(user.uid, {
      signup_method: "email",
      user_type: "authenticated",
      provider: "firebase",
    })

    return { user, error: null }
  } catch (error: any) {
    console.error("Email sign-in error:", error)
    return { user: null, error }
  }
}

// Sign up with email and password
export const signUpWithEmailFirebase = async (email: string, password: string, fullName: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const user = result.user

    // Create user profile in Firestore
    await createOrUpdateUserProfile(user, { fullName })

    // Track analytics
    setUserAnalyticsProperties(user.uid, {
      signup_method: "email",
      user_type: "authenticated",
      provider: "firebase",
    })

    return { user, error: null }
  } catch (error: any) {
    console.error("Email sign-up error:", error)
    return { user: null, error }
  }
}

// Sign out
export const signOutFirebase = async () => {
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error: any) {
    console.error("Sign-out error:", error)
    return { error }
  }
}

// Create or update user profile in Firestore
export const createOrUpdateUserProfile = async (user: User, additionalData?: any) => {
  const userRef = doc(db, "users", user.uid)

  try {
    const userDoc = await getDoc(userRef)

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || additionalData?.fullName || "",
      photoURL: user.photoURL || "",
      provider: user.providerData[0]?.providerId || "email",
      createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      reputationScore: userDoc.exists() ? userDoc.data().reputationScore : 100,
      totalReports: userDoc.exists() ? userDoc.data().totalReports : 0,
      subscriptionTier: userDoc.exists() ? userDoc.data().subscriptionTier : "free",
      preferences: userDoc.exists()
        ? userDoc.data().preferences
        : {
            notifications: true,
            radius: 500,
            autoRefresh: true,
          },
      ...additionalData,
    }

    await setDoc(userRef, userData, { merge: true })
    return userData
  } catch (error) {
    console.error("Error creating/updating user profile:", error)
    throw error
  }
}

// Get user profile from Firestore
export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      return userDoc.data()
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

// Update user subscription
export const updateUserSubscription = async (userId: string, tier: string) => {
  try {
    const userRef = doc(db, "users", userId)
    await setDoc(
      userRef,
      {
        subscriptionTier: tier,
        updatedAt: new Date(),
      },
      { merge: true },
    )

    // Track upgrade analytics
    trackUserUpgrade(tier)

    return { success: true }
  } catch (error) {
    console.error("Error updating subscription:", error)
    throw error
  }
}

// Auth state listener
export const onAuthStateChangedFirebase = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}
