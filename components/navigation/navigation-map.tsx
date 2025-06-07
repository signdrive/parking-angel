"use client"

import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"

interface NavigationMapProps {
  mapboxToken: string
}

export function NavigationMap({ mapboxToken }: NavigationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const routeSource = useRef<mapboxgl.GeoJSONSource | null>(null)
  const userMarker = useRef<mapboxgl.Marker | null>(null)
  const destinationMarker = useRef<mapboxgl.Marker | null>(null)

  const { currentRoute, userLocation, destination, currentStep, isDayMode } = useNavigationStore()

  const navigationService = NavigationService.getInstance()

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return

    mapboxgl.accessToken = mapboxToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDayMode ? "mapbox://styles/mapbox/navigation-day-v1" : "mapbox://styles/mapbox/navigation-night-v1",
      center: userLocation ? [userLocation.longitude, userLocation.latitude] : [-122.4194, 37.7749],
      zoom: 16,
      pitch: 60, // 3D perspective like TomTom
      bearing: userLocation?.heading || 0,
      attributionControl: false,
    })

    // Add navigation-specific controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: false,
        visualizePitch: true,
      }),
      "top-right",
    )

    // Disable map rotation with right click + drag
    map.current.dragRotate.disable()
    map.current.touchZoomRotate.disableRotation()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [mapboxToken, isDayMode])

  // Update map style when day/night mode changes
  useEffect(() => {
    if (!map.current) return

    const newStyle = isDayMode
      ? "mapbox://styles/mapbox/navigation-day-v1"
      : "mapbox://styles/mapbox/navigation-night-v1"

    map.current.setStyle(newStyle)
  }, [isDayMode])

  // Add route to map
  useEffect(() => {
    if (!map.current || !currentRoute) return

    map.current.on("load", () => {
      if (!map.current) return

      // Add route source
      if (!map.current.getSource("route")) {
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: currentRoute.geometry,
            },
          },
        })

        // Add route line layer
        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3B82F6",
            "line-width": 8,
            "line-opacity": 0.8,
          },
        })

        // Add route outline
        map.current.addLayer(
          {
            id: "route-outline",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#1E40AF",
              "line-width": 12,
              "line-opacity": 0.4,
            },
          },
          "route",
        )

        // Add completed route section
        map.current.addSource("completed-route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: currentRoute.geometry.slice(0, currentStep + 1),
            },
          },
        })

        map.current.addLayer({
          id: "completed-route",
          type: "line",
          source: "completed-route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#10B981",
            "line-width": 6,
            "line-opacity": 0.8,
          },
        })

        // Add turn points
        currentRoute.steps.forEach((step, index) => {
          if (step.maneuver.type !== "straight" && step.maneuver.type !== "arrive") {
            const el = document.createElement("div")
            el.className = "turn-marker"
            el.innerHTML = `
              <div class="w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-sm font-bold">
                ${navigationService.getManeuverIcon(step.maneuver)}
              </div>
            `

            new mapboxgl.Marker(el).setLngLat(step.coordinates).addTo(map.current!)
          }
        })
      }

      // Fit map to route
      const bounds = new mapboxgl.LngLatBounds()
      currentRoute.geometry.forEach((coord) => bounds.extend(coord))
      map.current.fitBounds(bounds, { padding: 50 })
    })

    // Update completed route as user progresses
    if (map.current.getSource("completed-route")) {
      const completedCoords = currentRoute.geometry.slice(0, Math.max(1, currentStep + 1))
      ;(map.current.getSource("completed-route") as mapboxgl.GeoJSONSource).setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: completedCoords,
        },
      })
    }
  }, [currentRoute, currentStep, navigationService])

  // Update user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return

    // Remove existing user marker
    if (userMarker.current) {
      userMarker.current.remove()
    }

    // Create user location marker with heading
    const el = document.createElement("div")
    el.className = "user-location-marker"
    el.innerHTML = `
      <div class="relative">
        <div class="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
        <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-blue-600" 
             style="transform: translateX(-50%) rotate(${userLocation.heading}deg)"></div>
      </div>
    `

    userMarker.current = new mapboxgl.Marker(el)
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .addTo(map.current)

    // Update map center and bearing to follow user
    map.current.easeTo({
      center: [userLocation.longitude, userLocation.latitude],
      bearing: userLocation.heading,
      duration: 1000,
    })
  }, [userLocation])

  // Add destination marker
  useEffect(() => {
    if (!map.current || !destination) return

    // Remove existing destination marker
    if (destinationMarker.current) {
      destinationMarker.current.remove()
    }

    // Create destination marker
    const el = document.createElement("div")
    el.className = "destination-marker"
    el.innerHTML = `
      <div class="w-10 h-10 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
        </svg>
      </div>
    `

    destinationMarker.current = new mapboxgl.Marker(el)
      .setLngLat([destination.longitude, destination.latitude])
      .addTo(map.current)
  }, [destination])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Navigation overlay elements */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">Navigation Mode</div>

      {/* Speed indicator */}
      {userLocation?.speed && userLocation.speed > 0 && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg">
          <div className="text-2xl font-bold">{Math.round(userLocation.speed * 2.237)}</div>
          <div className="text-xs opacity-75">mph</div>
        </div>
      )}

      {/* Next turn preview */}
      {currentRoute && currentStep < currentRoute.steps.length - 1 && (
        <div className="absolute bottom-20 right-4 bg-black/80 text-white p-3 rounded-lg max-w-48">
          <div className="text-xs opacity-75 mb-1">Next</div>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {navigationService.getManeuverIcon(currentRoute.steps[currentStep + 1].maneuver)}
            </span>
            <div className="text-sm">{currentRoute.steps[currentStep + 1].instruction}</div>
          </div>
          <div className="text-xs opacity-75 mt-1">
            in {navigationService.formatDistance(currentRoute.steps[currentStep + 1].distance)}
          </div>
        </div>
      )}
    </div>
  )
}
