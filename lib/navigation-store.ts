import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

export interface NavigationStep {
  id: string
  instruction: string
  distance: number
  duration: number
  maneuver: {
    type: "turn-left" | "turn-right" | "straight" | "merge" | "roundabout" | "arrive"
    modifier?: string
  }
  streetName: string
  coordinates: [number, number]
  speedLimit?: number
  laneGuidance?: {
    lanes: Array<{
      valid: boolean
      indications: string[]
    }>
  }
}

export interface NavigationRoute {
  id: string
  distance: number
  duration: number
  steps: NavigationStep[]
  geometry: [number, number][]
  trafficDelays: number
  alternativeRoutes?: NavigationRoute[]
}

export interface NavigationState {
  isNavigating: boolean
  currentRoute: NavigationRoute | null
  currentStep: number
  userLocation: {
    latitude: number
    longitude: number
    heading: number
    speed: number
  } | null
  destination: {
    latitude: number
    longitude: number
    name: string
    spotId?: string
  } | null
  eta: Date | null
  remainingDistance: number
  remainingTime: number
  isOffRoute: boolean
  isDayMode: boolean
  voiceEnabled: boolean
  isRecalculating: boolean
  gpsSignalStrength: "strong" | "weak" | "lost"
  parkingReservation: {
    spotId: string
    expiresAt: Date
    price: number
  } | null
  lastMileWalking: boolean
}

interface NavigationActions {
  startNavigation: (destination: NavigationState["destination"], route: NavigationRoute) => void
  stopNavigation: () => void
  updateUserLocation: (location: NavigationState["userLocation"]) => void
  nextStep: () => void
  recalculateRoute: () => Promise<void>
  toggleVoice: () => void
  setDayMode: (isDayMode: boolean) => void
  confirmArrival: () => Promise<void>
  updateGpsSignal: (strength: NavigationState["gpsSignalStrength"]) => void
  startLastMileWalking: () => void
}

export const useNavigationStore = create<NavigationState & NavigationActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isNavigating: false,
    currentRoute: null,
    currentStep: 0,
    userLocation: null,
    destination: null,
    eta: null,
    remainingDistance: 0,
    remainingTime: 0,
    isOffRoute: false,
    isDayMode: true,
    voiceEnabled: true,
    isRecalculating: false,
    gpsSignalStrength: "strong",
    parkingReservation: null,
    lastMileWalking: false,

    // Actions
    startNavigation: (destination, route) => {
      set({
        isNavigating: true,
        destination,
        currentRoute: route,
        currentStep: 0,
        remainingDistance: route.distance,
        remainingTime: route.duration,
        eta: new Date(Date.now() + route.duration * 1000),
        isOffRoute: false,
        isRecalculating: false,
        lastMileWalking: false,
      })
    },

    stopNavigation: () => {
      set({
        isNavigating: false,
        currentRoute: null,
        currentStep: 0,
        destination: null,
        eta: null,
        remainingDistance: 0,
        remainingTime: 0,
        isOffRoute: false,
        isRecalculating: false,
        lastMileWalking: false,
      })
    },

    updateUserLocation: (location) => {
      const state = get()
      if (!state.isNavigating || !state.currentRoute) return

      // Calculate remaining distance and time
      const currentStepIndex = state.currentStep
      const remainingSteps = state.currentRoute.steps.slice(currentStepIndex)
      const remainingDistance = remainingSteps.reduce((sum, step) => sum + step.distance, 0)
      const remainingTime = remainingSteps.reduce((sum, step) => sum + step.duration, 0)

      // Check if close to destination for last mile walking
      const isCloseToDestination = remainingDistance < 100 // 100 meters

      set({
        userLocation: location,
        remainingDistance,
        remainingTime,
        eta: new Date(Date.now() + remainingTime * 1000),
        lastMileWalking: isCloseToDestination && !state.lastMileWalking,
      })
    },

    nextStep: () => {
      const state = get()
      if (!state.currentRoute || state.currentStep >= state.currentRoute.steps.length - 1) return

      set({ currentStep: state.currentStep + 1 })
    },

    recalculateRoute: async () => {
      set({ isRecalculating: true })

      try {
        const state = get()
        if (!state.userLocation || !state.destination) return

        const response = await fetch("/api/navigation/recalculate-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from: [state.userLocation.longitude, state.userLocation.latitude],
            to: [state.destination.longitude, state.destination.latitude],
          }),
        })

        const newRoute = await response.json()

        set({
          currentRoute: newRoute,
          currentStep: 0,
          isOffRoute: false,
          isRecalculating: false,
        })
      } catch (error) {
        console.error("Failed to recalculate route:", error)
        set({ isRecalculating: false })
      }
    },

    toggleVoice: () => {
      set((state) => ({ voiceEnabled: !state.voiceEnabled }))
    },

    setDayMode: (isDayMode) => {
      set({ isDayMode })
    },

    confirmArrival: async () => {
      const state = get()
      if (!state.destination?.spotId) return

      try {
        await fetch("/api/parking/confirm-arrival", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            spotId: state.destination.spotId,
            arrivalTime: new Date().toISOString(),
          }),
        })

        // Stop navigation after successful arrival confirmation
        get().stopNavigation()
      } catch (error) {
        console.error("Failed to confirm arrival:", error)
      }
    },

    updateGpsSignal: (strength) => {
      set({ gpsSignalStrength: strength })
    },

    startLastMileWalking: () => {
      set({ lastMileWalking: true })
    },
  })),
)
