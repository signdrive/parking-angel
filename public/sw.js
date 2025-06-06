// Production-grade Service Worker with Self-Healing Capabilities
const CACHE_NAME = "parking-angel-v5"
const STATIC_CACHE = "parking-angel-static-v5"
const ICON_CACHE = "parking-angel-icons-v5"
const API_CACHE = "parking-angel-api-v5"

// Essential files for offline functionality
const ESSENTIAL_FILES = ["/", "/dashboard", "/manifest.webmanifest", "/offline.html"]

// All icon files for comprehensive caching
const ICON_FILES = [
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/favicon-32x32.png",
  "/favicon-16x16.png",
  "/icons/icon-180x180.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/legacy-icon.png",
]

// API endpoints to cache
const API_ENDPOINTS = ["/api/spots/nearby", "/api/mapbox/token", "/api/mapbox/status"]

// Install event - comprehensive caching with error handling
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing with self-healing capabilities...")

  event.waitUntil(
    Promise.allSettled([
      // Cache essential files
      caches
        .open(STATIC_CACHE)
        .then((cache) => {
          console.log("Service Worker: Caching essential files")
          return Promise.allSettled(
            ESSENTIAL_FILES.map((url) =>
              fetch(url)
                .then((response) => (response.ok ? cache.put(url, response) : Promise.reject()))
                .catch(() => console.warn(`Failed to cache: ${url}`)),
            ),
          )
        }),

      // Cache all icon files with fallbacks
      caches
        .open(ICON_CACHE)
        .then((cache) => {
          console.log("Service Worker: Caching icon files")
          return Promise.allSettled(
            ICON_FILES.map((iconUrl) =>
              fetch(iconUrl)
                .then((response) => {
                  if (response.ok) {
                    return cache.put(iconUrl, response)
                  }
                  console.warn(`Service Worker: Failed to cache icon ${iconUrl}`)
                })
                .catch((error) => {
                  console.warn(`Service Worker: Error caching icon ${iconUrl}:`, error)
                }),
            ),
          )
        }),

      // Pre-cache API endpoints
      caches
        .open(API_CACHE)
        .then((cache) => {
          console.log("Service Worker: Pre-caching API endpoints")
          return Promise.allSettled(
            API_ENDPOINTS.map((endpoint) =>
              fetch(endpoint)
                .then((response) => (response.ok ? cache.put(endpoint, response) : Promise.reject()))
                .catch(() => console.warn(`Failed to pre-cache API: ${endpoint}`)),
            ),
          )
        }),
    ])
      .then(() => {
        console.log("Service Worker: Installation complete with self-healing system")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("Service Worker: Installation failed", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== ICON_CACHE &&
              cacheName !== API_CACHE &&
              cacheName.startsWith("parking-angel")
            ) {
              console.log("Service Worker: Deleting old cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: Activated with self-healing system")
        return self.clients.claim()
      }),
  )
})

// Fetch event with comprehensive error handling and fallbacks
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET requests
  if (request.method !== "GET") {
    return
  }

  // Special handling for icon requests
  if (isIconRequest(url.pathname)) {
    event.respondWith(handleIconRequest(request))
    return
  }

  // Special handling for API requests
  if (isApiRequest(url.pathname)) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Regular fetch handling with fallbacks
  event.respondWith(handleRegularRequest(request))
})

// Icon request handler with comprehensive fallback system
async function handleIconRequest(request) {
  const url = new URL(request.url)

  try {
    // Try cache first
    const iconCache = await caches.open(ICON_CACHE)
    const cachedIcon = await iconCache.match(request)

    if (cachedIcon) {
      console.log(`Service Worker: Serving cached icon: ${url.pathname}`)
      return cachedIcon
    }

    // Try to fetch the requested icon
    const response = await fetch(request)
    if (response.ok) {
      const responseClone = response.clone()
      iconCache.put(request, responseClone)
      console.log(`Service Worker: Fetched and cached icon: ${url.pathname}`)
      return response
    }

    // Fallback to alternative icons
    return await getFallbackIcon(url.pathname, iconCache)
  } catch (error) {
    console.error(`Service Worker: Error handling icon request for ${url.pathname}:`, error)
    const iconCache = await caches.open(ICON_CACHE)
    return await getFallbackIcon(url.pathname, iconCache)
  }
}

// API request handler with caching and fallbacks
async function handleApiRequest(request) {
  const apiCache = await caches.open(API_CACHE)

  try {
    // Try network first for fresh data
    const response = await fetch(request)
    if (response.ok) {
      const responseClone = response.clone()
      apiCache.put(request, responseClone)
      return response
    }

    // Fallback to cache
    const cachedResponse = await apiCache.match(request)
    if (cachedResponse) {
      console.log("Service Worker: Serving cached API response")
      return cachedResponse
    }

    throw new Error("No cached response available")
  } catch (error) {
    console.warn("Service Worker: API request failed, trying cache", error)

    const cachedResponse = await apiCache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline response for API failures
    return new Response(
      JSON.stringify({
        error: "Offline",
        message: "This feature is not available offline",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

// Regular request handler
async function handleRegularRequest(request) {
  try {
    const cachedResponse = await caches.match(request)

    if (cachedResponse) {
      // Serve from cache and update in background
      fetchAndCache(request)
      return cachedResponse
    }

    // Try network
    const response = await fetch(request)
    if (response.ok) {
      // Cache successful responses
      const responseClone = response.clone()
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, responseClone)
      return response
    }

    throw new Error(`HTTP ${response.status}`)
  } catch (error) {
    console.warn("Service Worker: Request failed", error)

    // Try cache again
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      const offlinePage = await caches.match("/offline.html")
      if (offlinePage) {
        return offlinePage
      }
    }

    throw error
  }
}

// Background fetch and cache
async function fetchAndCache(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response)
    }
  } catch (error) {
    console.warn("Service Worker: Background fetch failed", error)
  }
}

// Fallback icon system with multiple options
async function getFallbackIcon(requestedPath, iconCache) {
  const fallbackOrder = [
    "/apple-touch-icon.png",
    "/icons/icon-192x192.png",
    "/icons/icon-180x180.png",
    "/icons/legacy-icon.png",
    "/favicon.ico",
  ]

  for (const fallbackPath of fallbackOrder) {
    try {
      const fallbackIcon = await iconCache.match(fallbackPath)
      if (fallbackIcon) {
        console.log(`Service Worker: Using fallback icon ${fallbackPath} for ${requestedPath}`)
        return fallbackIcon
      }
    } catch (error) {
      console.warn(`Service Worker: Fallback icon ${fallbackPath} not available`)
    }
  }

  // Generate a minimal SVG icon as ultimate fallback
  const svgIcon = `
    <svg width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="180" fill="#3b82f6"/>
      <text x="90" y="100" font-family="Arial" font-size="60" fill="white" text-anchor="middle">PA</text>
    </svg>
  `

  return new Response(svgIcon, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  })
}

// Utility functions
function isIconRequest(pathname) {
  return (
    pathname.includes("apple-touch-icon") ||
    pathname.includes("favicon") ||
    pathname.includes("/icons/") ||
    pathname.endsWith(".ico") ||
    (pathname.endsWith(".png") && pathname.includes("icon"))
  )
}

function isApiRequest(pathname) {
  return pathname.startsWith("/api/")
}

// Push notification event with icon handling
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push notification received")

  const title = "Parking Angel"
  const options = {
    body: "New parking update available!",
    icon: "/apple-touch-icon.png",
    badge: "/favicon.ico",
    tag: "parking-update",
    data: { url: "/dashboard" },
    actions: [
      {
        action: "view",
        title: "View Details",
        icon: "/icons/icon-192x192.png",
      },
    ],
  }

  if (event.data) {
    try {
      const payload = event.data.json()
      options.body = payload.body || options.body
      options.data = { ...options.data, ...payload.data }
    } catch (error) {
      console.warn("Service Worker: Error parsing push data", error)
    }
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked")
  event.notification.close()

  const urlToOpen = event.notification.data?.url || "/dashboard"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    }),
  )
})

// Error handling for unhandled promise rejections
self.addEventListener("unhandledrejection", (event) => {
  console.error("Service Worker: Unhandled promise rejection", event.reason)
  event.preventDefault()
})

console.log("Service Worker: Loaded with comprehensive self-healing system")
