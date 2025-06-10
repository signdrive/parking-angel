// Production-grade Service Worker with Comprehensive Error Handling
const CACHE_NAME = "parking-angel-v7"
const STATIC_CACHE = "parking-angel-static-v7"
const ICON_CACHE = "parking-angel-icons-v7"
const API_CACHE = "parking-angel-api-v7"

// Essential files for offline functionality
const ESSENTIAL_FILES = ["/", "/dashboard", "/offline.html"]

// All icon files for comprehensive caching
const ICON_FILES = [
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/favicon-32x32.png",
  "/favicon-16x16.png",
  "/icon-192x192.png",
  "/icon-512x512.png",
]

// External domains to ignore (don't cache)
const EXTERNAL_DOMAINS = [
  "googletagmanager.com",
  "google-analytics.com",
  "googleapis.com",
  "googleusercontent.com",
  "gstatic.com",
  "supabase.co", // Add this line
]

// Install event with minimal caching
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing v7...")

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching essential files only")
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
      }),
  )
})

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating v7...")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith("parking-angel")) {
              console.log("Service Worker: Deleting old cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: Activated v7")
        return self.clients.claim()
      }),
  )
})

// Fetch event with comprehensive error handling
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip Supabase API requests completely - let them go directly
  if (url.hostname.includes("supabase.co")) {
    return
  }

  // Skip external domains that we don't want to cache
  if (EXTERNAL_DOMAINS.some((domain) => url.hostname.includes(domain))) {
    // Let external requests fail naturally without intervention
    return
  }

  // DO NOT INTERCEPT ICON REQUESTS - let them go directly to the server
  if (
    url.pathname.includes("icon") ||
    url.pathname.includes("favicon") ||
    url.pathname.includes("apple-touch") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.includes("manifest")
  ) {
    return // Let these requests go through normally
  }

  // Handle different types of requests
  if (isApiRequest(url.pathname)) {
    event.respondWith(handleApiRequest(request))
  } else {
    event.respondWith(handleRegularRequest(request))
  }
})

// API request handler with better error handling
async function handleApiRequest(request) {
  try {
    const apiCache = await caches.open(API_CACHE)

    // Try network first for fresh data
    try {
      const response = await fetch(request, { timeout: 10000 })
      if (response.ok) {
        const responseClone = response.clone()
        apiCache.put(request, responseClone).catch(() => {}) // Don't block on cache errors
        return response
      }
    } catch (fetchError) {
      console.warn("Service Worker: API fetch failed, trying cache:", fetchError.message)
    }

    // Fallback to cache
    const cachedResponse = await apiCache.match(request)
    if (cachedResponse) {
      console.log("Service Worker: Serving cached API response")
      return cachedResponse
    }

    // Return offline response for API failures
    return new Response(
      JSON.stringify({
        error: "Offline",
        message: "This feature is not available offline",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      },
    )
  } catch (error) {
    console.error("Service Worker: API request error:", error)
    return new Response(
      JSON.stringify({
        error: "Service Worker Error",
        message: "An error occurred processing your request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

// Regular request handler with better error handling
async function handleRegularRequest(request) {
  try {
    const staticCache = await caches.open(STATIC_CACHE)

    // Try cache first for better performance
    const cachedResponse = await staticCache.match(request)
    if (cachedResponse) {
      // Serve from cache and update in background
      updateCacheInBackground(request, staticCache)
      return cachedResponse
    }

    // Try network
    try {
      const response = await fetch(request, { timeout: 10000 })
      if (response.ok) {
        // Cache successful responses
        const responseClone = response.clone()
        staticCache.put(request, responseClone).catch(() => {}) // Don't block on cache errors
        return response
      } else {
        console.warn(`Service Worker: HTTP ${response.status} for ${request.url}`)
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (fetchError) {
      console.warn("Service Worker: Network request failed:", fetchError.message)

      // Try cache again as final fallback
      const fallbackResponse = await staticCache.match(request)
      if (fallbackResponse) {
        return fallbackResponse
      }

      // Return offline page for navigation requests
      if (request.mode === "navigate") {
        const offlinePage = await staticCache.match("/offline.html")
        if (offlinePage) {
          return offlinePage
        }
      }

      // Return a proper error response instead of throwing
      return new Response("Service Unavailable", {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "text/plain" },
      })
    }
  } catch (error) {
    console.error("Service Worker: Request handling error:", error)
    return new Response("Internal Error", {
      status: 500,
      statusText: "Internal Server Error",
      headers: { "Content-Type": "text/plain" },
    })
  }
}

// Background cache update
async function updateCacheInBackground(request, cache) {
  try {
    const response = await fetch(request, { timeout: 5000 })
    if (response.ok) {
      await cache.put(request, response)
    }
  } catch (error) {
    // Silently fail background updates
    console.warn("Service Worker: Background update failed:", error.message)
  }
}

// Utility functions
function isApiRequest(pathname) {
  return pathname.startsWith("/api/")
}

// Enhanced error handling for unhandled promise rejections
self.addEventListener("unhandledrejection", (event) => {
  console.error("Service Worker: Unhandled promise rejection:", event.reason)
  event.preventDefault() // Prevent the error from being logged to console repeatedly
})

// Enhanced error handling for general errors
self.addEventListener("error", (event) => {
  console.error("Service Worker: General error:", event.error)
})

// Push notification event with error handling
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push notification received")

  try {
    const title = "Parking Angel"
    const options = {
      body: "New parking update available!",
      icon: "/icon-192x192.png",
      badge: "/favicon.ico",
      tag: "parking-update",
      data: { url: "/dashboard" },
      requireInteraction: false,
      silent: false,
    }

    if (event.data) {
      try {
        const payload = event.data.json()
        options.body = payload.body || options.body
        options.data = { ...options.data, ...payload.data }
      } catch (parseError) {
        console.warn("Service Worker: Error parsing push data:", parseError)
      }
    }

    event.waitUntil(
      self.registration
        .showNotification(title, options)
        .catch((error) => console.error("Service Worker: Notification error:", error)),
    )
  } catch (error) {
    console.error("Service Worker: Push event error:", error)
  }
})

// Notification click event with error handling
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked")

  try {
    event.notification.close()

    const urlToOpen = event.notification.data?.url || "/dashboard"

    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
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
        .catch((error) => console.error("Service Worker: Client handling error:", error)),
    )
  } catch (error) {
    console.error("Service Worker: Notification click error:", error)
  }
})

console.log("Service Worker v7: Loaded with minimal icon interference")
