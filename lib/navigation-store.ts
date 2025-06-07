import { create } from "zustand"
import { persist } from "zustand/middleware"

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
      | "depart"
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
}

export interface NavigationSettings {
  mapStyle: "navigation" | "satellite" | "terrain" | "street" | "hybrid"
  viewMode: "2d" | "3d" | "bird-eye" | "follow"
  showTraffic: boolean
  showIncidents: boolean
  showSpeedLimits: boolean
  showLaneGuidance: boolean
  voiceGuidance: boolean
  routePreference: "fastest" | "shortest" | "eco" | "avoid-highways"
  units: "metric" | "imperial"
  theme: "auto" | "day" | "night"
}

export interface NavigationDestination {
  latitude: number
  longitude: number
  name: string
  spotId?: string
}

interface NavigationState {
  // Navigation state
  isNavigating: boolean

  // Route data
  currentRoute: NavigationRoute | null
  currentStep: number
  userLocation: {
    latitude: number
    longitude: number
    heading: number
    speed: number
  } | null
  destination: NavigationDestination | null
  // Navigation state
  eta: Date | null
  remainingDistance: number
  remainingTime: number
  isOffRoute: boolean
  isRecalculating: boolean
  gpsSignalStrength: "strong" | "weak" | "lost"
  lastMileWalking: boolean
  nextStep: NavigationStep | null

  // Settings
  settings: NavigationSettings

  // Actions
  startNavigation: (destination: NavigationDestination, route: NavigationRoute) => void
  stopNavigation: () => void
  setRoute: (route: NavigationRoute) => void
  setDestination: (destination: NavigationDestination) => void
  updateUserLocation: (location: { latitude: number; longitude: number; heading: number; speed: number }) => void
  nextStepAction: () => void
  recalculateRoute: () => void
  confirmArrival: () => void
  updateGpsSignal: (strength: "strong" | "weak" | "lost") => void
  updateSettings: (settings: Partial<NavigationSettings>) => void
  resetNavigation: () => void
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
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
      isRecalculating: false,
      gpsSignalStrength: "strong",
      lastMileWalking: false,
      nextStep: null,

      // Default settings - 3D is default
      settings: {
        mapStyle: "navigation",
        viewMode: "3d", // Default to 3D
        showTraffic: true,
        showIncidents: true,
        showSpeedLimits: true,
        showLaneGuidance: true,
        voiceGuidance: true,
        routePreference: "fastest",
        units: "imperial",
        theme: "auto",
      },

      // Actions
      startNavigation: (destination: NavigationDestination, route: NavigationRoute) => {
        console.log("🚀 Starting navigation to:", destination.name)
        set({
          isNavigating: true,
          destination,
          currentRoute: route,
          currentStep: 0,
          remainingDistance: route.distance,
          remainingTime: route.duration,
          eta: new Date(Date.now() + route.duration * 1000),
          nextStep: route.steps[1] || null,
        })
      },

      stopNavigation: () => {
        console.log("🛑 Stopping navigation")
        set({
          isNavigating: false,
          currentRoute: null,
          currentStep: 0,
          destination: null,
          eta: null,
          remainingDistance: 0,
          remainingTime: 0,
          nextStep: null,
          isOffRoute: false,
          isRecalculating: false,
        })
      },

      setRoute: (route) => {
        const state = get()
        set({
          currentRoute: route,
          currentStep: 0,
          remainingDistance: route.distance,
          remainingTime: route.duration,
          eta: new Date(Date.now() + route.duration * 1000),
          nextStep: route.steps[1] || null,
        })
      },

      setDestination: (destination: NavigationDestination) => set({ destination }),

      updateUserLocation: (location) => set({ userLocation: location }),

      nextStepAction: () => {
        const state = get()
        if (state.currentRoute && state.currentStep < state.currentRoute.steps.length - 1) {
          const newStep = state.currentStep + 1
          const remainingSteps = state.currentRoute.steps.slice(newStep)
          const remainingDistance = remainingSteps.reduce((sum, step) => sum + step.distance, 0)
          const remainingTime = remainingSteps.reduce((sum, step) => sum + step.duration, 0)

          set({
            currentStep: newStep,
            remainingDistance,
            remainingTime,
            eta: new Date(Date.now() + remainingTime * 1000),
            nextStep: state.currentRoute.steps[newStep + 1] || null,
          })
        }
      },

      recalculateRoute: () => {
        set({ isRecalculating: true })
        // Simulate recalculation
        setTimeout(() => {
          set({ isRecalculating: false, isOffRoute: false })
        }, 2000)
      },

      confirmArrival: () => {
        set({
          isNavigating: false,
          currentRoute: null,
          currentStep: 0,
          destination: null,
          eta: null,
          remainingDistance: 0,
          remainingTime: 0,
          nextStep: null,
        })
      },

      updateGpsSignal: (strength) => set({ gpsSignalStrength: strength }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      resetNavigation: () =>
        set({
          isNavigating: false,
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
          lastMileWalking: false,
          nextStep: null,
        }),
    }),
    {
      name: "navigation-store",
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
)

// Helper types and functions
interface Location {
  latitude: number
  longitude: number
}

interface Route {
  distance: number
  duration: number
  geometry: number[][]
  steps: RouteStep[]
  trafficDelays: number
}

interface RouteStep {
  distance: number
  duration: number
  instruction: string
  maneuver: { type: string }
  streetName: string
  speedLimit: number
}

// Generate realistic highway navigation data
const generateRealisticRoute = (start: Location, end: Location): Route => {
  return {
    distance: 5000, // 5km realistic distance
    duration: 600, // 10 minutes
    geometry: [
      [start.longitude, start.latitude],
      [start.longitude + 0.01, start.latitude + 0.005],
      [start.longitude + 0.02, start.latitude + 0.01],
      [end.longitude, end.latitude],
    ],
    steps: [
      {
        distance: 500,
        duration: 60,
        instruction: "Head north on Main Street",
        maneuver: { type: "depart" },
        streetName: "Main Street",
        speedLimit: 35,
      },
      {
        distance: 2000,
        duration: 240,
        instruction: "Continue straight on Highway 101",
        maneuver: { type: "straight" },
        streetName: "Highway 101",
        speedLimit: 65,
      },
      {
        distance: 1500,
        duration: 180,
        instruction: "Take exit 15 toward Downtown",
        maneuver: { type: "turn-right" },
        streetName: "Exit 15",
        speedLimit: 45,
      },
      {
        distance: 1000,
        duration: 120,
        instruction: "Turn right onto Parking Street",
        maneuver: { type: "turn-right" },
        streetName: "Parking Street",
        speedLimit: 25,
      },
    ],
    trafficDelays: 0,
  }
}

export { generateRealisticRoute }
export type { Location, Route }
