// Park Algo Service Worker - Development Friendly
const CACHE_NAME = "park-algo-v10"
const STATIC_CACHE = "park-algo-static-v10"

// Essential files for offline functionality
const ESSENTIAL_FILES = [
  "/",
  "/dashboard",
  "/offline.html"
]

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching essential files")
        return cache.addAll(ESSENTIAL_FILES).catch((error) => {
          console.warn("Service Worker: Some files failed to cache", error)
        })
      })
      .then(() => {
        console.log("Service Worker: Installation complete")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("Service Worker: Installation failed", error)
      })
  )
})

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...")
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                (cacheName.startsWith("parking-angel") || cacheName.startsWith("park-algo"))) {
              console.log("Service Worker: Deleting old cache", cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log("Service Worker: Activated")
        return self.clients.claim()
      })
  )
})

// Fetch event - MINIMAL INTERFERENCE FOR DEVELOPMENT
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip ALL requests in development mode (localhost)
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    return // Let all localhost requests go through normally
  }

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip external domains we don't want to cache
  if (url.hostname.includes("googleapis.com") || 
      url.hostname.includes("google-analytics.com") ||
      url.hostname.includes("googletagmanager.com") ||
      url.hostname.includes("supabase.co") ||
      url.hostname.includes("firebase.com")) {
    return
  }

  // Only handle requests for production domains
  if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    event.respondWith(handleRequest(request))
  }
})

// Request handler for production only
async function handleRequest(request) {
  try {
    // Try network first
    const response = await fetch(request)
    if (response.ok) {
      // Cache successful responses
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone()).catch(() => {})
      return response
    }
    throw new Error(`HTTP ${response.status}`)
  } catch (error) {
    // Try cache as fallback
    const cache = await caches.open(STATIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      const offlinePage = await cache.match("/offline.html")
      if (offlinePage) {
        return offlinePage
      }
    }

    // Return error response
    return new Response("Service Unavailable", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain" }
    })
  }
}

// Push notification event
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push notification received")

  const title = "Park Algo"
  const options = {
    body: "New parking update available!",
    icon: "/icon-192x192.png",
    badge: "/favicon.ico",
    tag: "parking-update",
    data: { url: "/dashboard" }
  }

  if (event.data) {
    try {
      const payload = event.data.json()
      options.body = payload.body || options.body
      options.data = { ...options.data, ...payload.data }
    } catch (error) {
      console.warn("Service Worker: Error parsing push data:", error)
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
      .catch((error) => console.error("Service Worker: Notification error:", error))
  )
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked")
  
  event.notification.close()
  
  const urlToOpen = event.notification.data?.url || "/dashboard"
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
      .catch((error) => console.error("Service Worker: Client handling error:", error))
  )
})

// Error handling
self.addEventListener("error", (event) => {
  console.error("Service Worker: Error:", event.error)
})

self.addEventListener("unhandledrejection", (event) => {
  console.error("Service Worker: Unhandled rejection:", event.reason)
  event.preventDefault()
})

console.log("Service Worker: Loaded successfully (Development Mode)")