import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface NavigationStep {
  id: string
  instruction: string
  distance: number
  duration: number
  maneuver: {
    type:
      | "straight"
      | "turn-left"
      | "turn-right"
      | "merge"
      | "roundabout"
      | "arrive"
      | "u-turn"
      | "fork-left"
      | "fork-right"
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

export interface ParkingSpot {
  id: string
  name: string
  latitude: number
  longitude: number
  price?: number
  timeLimit?: number
  reservationId?: string
}

export interface NavigationState {
  // Navigation state
  isNavigating: boolean
  isFullScreen: boolean

  // Route data
  currentRoute: NavigationRoute | null
  currentStep: number
  userLocation: {
    latitude: number
    longitude: number
    heading: number
    speed: number
    accuracy: number
  } | null
  destination: ParkingSpot | null

  // Navigation state
  eta: Date | null
  remainingDistance: number
  remainingTime: number
  isOffRoute: boolean
  isRecalculating: boolean
  gpsSignalStrength: "strong" | "weak" | "lost"

  // UI state
  mapMode: "day" | "night" | "auto"
  voiceEnabled: boolean
  showTraffic: boolean
  showSpeedLimits: boolean
  compassHeading: number

  // Parking specific
  parkingReservation: {
    spotId: string
    expiresAt: Date
    confirmationCode: string
  } | null
  lastMileWalking: boolean
  arrivalConfirmed: boolean

  // Error handling
  error: string | null
  offlineMode: boolean
}

const initialState: NavigationState = {
  isNavigating: false,
  isFullScreen: false,
  currentRoute: null,
  currentStep: 0,
  userLocation: null,
  destination: null,
  eta: null,
  remainingDistance: 0,
  remainingTime: 0,
  isOffRoute: false,
  isRecalculating: false,
  gpsSignalStrength: "strong",
  mapMode: "auto",
  voiceEnabled: true,
  showTraffic: true,
  showSpeedLimits: true,
  compassHeading: 0,
  parkingReservation: null,
  lastMileWalking: false,
  arrivalConfirmed: false,
  error: null,
  offlineMode: false,
}

const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    startNavigation: (state, action: PayloadAction<{ destination: ParkingSpot; route: NavigationRoute }>) => {
      state.isNavigating = true
      state.isFullScreen = true
      state.destination = action.payload.destination
      state.currentRoute = action.payload.route
      state.currentStep = 0
      state.remainingDistance = action.payload.route.distance
      state.remainingTime = action.payload.route.duration
      state.eta = new Date(Date.now() + action.payload.route.duration * 1000)
      state.error = null
    },

    stopNavigation: (state) => {
      state.isNavigating = false
      state.isFullScreen = false
      state.currentRoute = null
      state.currentStep = 0
      state.destination = null
      state.eta = null
      state.remainingDistance = 0
      state.remainingTime = 0
      state.isOffRoute = false
      state.isRecalculating = false
      state.parkingReservation = null
      state.lastMileWalking = false
      state.arrivalConfirmed = false
    },

    updateUserLocation: (state, action: PayloadAction<NavigationState["userLocation"]>) => {
      state.userLocation = action.payload
      if (action.payload) {
        state.compassHeading = action.payload.heading
      }
    },

    nextStep: (state) => {
      if (state.currentRoute && state.currentStep < state.currentRoute.steps.length - 1) {
        state.currentStep += 1
        const remainingSteps = state.currentRoute.steps.slice(state.currentStep)
        state.remainingDistance = remainingSteps.reduce((sum, step) => sum + step.distance, 0)
        state.remainingTime = remainingSteps.reduce((sum, step) => sum + step.duration, 0)
        state.eta = new Date(Date.now() + state.remainingTime * 1000)
      }
    },

    setOffRoute: (state, action: PayloadAction<boolean>) => {
      state.isOffRoute = action.payload
      if (action.payload) {
        state.isRecalculating = true
      }
    },

    setRecalculating: (state, action: PayloadAction<boolean>) => {
      state.isRecalculating = action.payload
    },

    updateRoute: (state, action: PayloadAction<NavigationRoute>) => {
      state.currentRoute = action.payload
      state.currentStep = 0
      state.remainingDistance = action.payload.distance
      state.remainingTime = action.payload.duration
      state.eta = new Date(Date.now() + action.payload.duration * 1000)
      state.isOffRoute = false
      state.isRecalculating = false
    },

    setGpsSignal: (state, action: PayloadAction<NavigationState["gpsSignalStrength"]>) => {
      state.gpsSignalStrength = action.payload
    },

    toggleVoice: (state) => {
      state.voiceEnabled = !state.voiceEnabled
    },

    setMapMode: (state, action: PayloadAction<NavigationState["mapMode"]>) => {
      state.mapMode = action.payload
    },

    setParkingReservation: (state, action: PayloadAction<NavigationState["parkingReservation"]>) => {
      state.parkingReservation = action.payload
    },

    setLastMileWalking: (state, action: PayloadAction<boolean>) => {
      state.lastMileWalking = action.payload
    },

    confirmArrival: (state) => {
      state.arrivalConfirmed = true
      state.isNavigating = false
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },

    setOfflineMode: (state, action: PayloadAction<boolean>) => {
      state.offlineMode = action.payload
    },

    toggleFullScreen: (state) => {
      state.isFullScreen = !state.isFullScreen
    },
  },
})

export const {
  startNavigation,
  stopNavigation,
  updateUserLocation,
  nextStep,
  setOffRoute,
  setRecalculating,
  updateRoute,
  setGpsSignal,
  toggleVoice,
  setMapMode,
  setParkingReservation,
  setLastMileWalking,
  confirmArrival,
  setError,
  setOfflineMode,
  toggleFullScreen,
} = navigationSlice.actions

export const navigationStore = configureStore({
  reducer: {
    navigation: navigationSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["navigation/startNavigation", "navigation/setParkingReservation"],
        ignoredPaths: ["navigation.eta", "navigation.parkingReservation.expiresAt"],
      },
    }),
})

export type RootState = ReturnType<typeof navigationStore.getState>
export type AppDispatch = typeof navigationStore.dispatch
