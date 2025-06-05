import { db } from "./firebase"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  GeoPoint,
} from "firebase/firestore"

// Real-time parking spots collection
export const COLLECTIONS = {
  PARKING_SPOTS: "parking_spots",
  USER_ACTIVITIES: "user_activities",
  AI_PREDICTIONS: "ai_predictions",
  NOTIFICATIONS: "notifications",
} as const

// Add a new parking spot to Firebase
export const addParkingSpot = async (spotData: {
  latitude: number
  longitude: number
  spotType: string
  address?: string
  reportedBy: string
  notes?: string
}) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.PARKING_SPOTS), {
      ...spotData,
      location: new GeoPoint(spotData.latitude, spotData.longitude),
      isAvailable: true,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 15 * 60 * 1000)), // 15 minutes
      confidenceScore: 100,
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding parking spot:", error)
    throw error
  }
}

// Listen to real-time parking spots updates
export const subscribeToParkingSpots = (
  location: { lat: number; lng: number },
  radius: number,
  callback: (spots: any[]) => void,
) => {
  const spotsQuery = query(
    collection(db, COLLECTIONS.PARKING_SPOTS),
    where("isAvailable", "==", true),
    where("expiresAt", ">", Timestamp.now()),
    orderBy("expiresAt"),
    limit(50),
  )

  return onSnapshot(spotsQuery, (snapshot) => {
    const spots = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Filter by distance (simple approximation)
    const filteredSpots = spots.filter((spot) => {
      if (!spot.location) return false
      const distance = calculateDistance(location.lat, location.lng, spot.location.latitude, spot.location.longitude)
      return distance <= radius / 1000 // Convert meters to km
    })

    callback(filteredSpots)
  })
}

// Update parking spot status
export const updateParkingSpot = async (spotId: string, updates: any) => {
  try {
    const spotRef = doc(db, COLLECTIONS.PARKING_SPOTS, spotId)
    await updateDoc(spotRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error("Error updating parking spot:", error)
    throw error
  }
}

// Delete parking spot
export const deleteParkingSpot = async (spotId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.PARKING_SPOTS, spotId))
  } catch (error) {
    console.error("Error deleting parking spot:", error)
    throw error
  }
}

// Log user activity
export const logUserActivity = async (userId: string, activity: any) => {
  try {
    await addDoc(collection(db, COLLECTIONS.USER_ACTIVITIES), {
      userId,
      ...activity,
      timestamp: Timestamp.now(),
    })
  } catch (error) {
    console.error("Error logging user activity:", error)
  }
}

// Store AI predictions
export const storeAIPrediction = async (predictionData: any) => {
  try {
    await addDoc(collection(db, COLLECTIONS.AI_PREDICTIONS), {
      ...predictionData,
      timestamp: Timestamp.now(),
    })
  } catch (error) {
    console.error("Error storing AI prediction:", error)
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
