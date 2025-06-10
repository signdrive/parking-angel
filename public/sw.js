// Production-grade Service Worker with Better API Handling
const CACHE_NAME = "parking-angel-v8"
const STATIC_CACHE = "parking-angel-static-v8"
const API_CACHE = "parking-angel-api-v8"

// Essential files for offline functionality
const ESSENTIAL_FILES = ["/", "/dashboard", "/offline.html"]

// External domains to ignore (don't cache)
const EXTERNAL_DOMAINS = [
  "googletagmanager.com",
  "google-analytics.com",
  "googleapis.com",
  "googleusercontent.com",
  "gstatic.com",
  "supabase.co", // Don't interfere with Supabase
]

// Install event with minimal caching
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing v8...")

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
  console.log("Service Worker: Activating v8...")

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
        console.log("Service Worker: Activated v8")
        return self.clients.claim()
      }),
  )
})

// Fetch event with better API handling
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip external domains that we don't want to cache
  if (EXTERNAL_DOMAINS.some((domain) => url.hostname.includes(domain))) {
    // Let external requests go through without intervention
    return
  }

  // Skip Supabase API requests entirely - let them handle their own caching
  if (url.hostname.includes("supabase.co")) {
    return
  }

  // Skip internal API routes - let them handle their own responses
  if (url.pathname.startsWith("/api/")) {
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

  // Only handle static assets and pages
  event.respondWith(handleStaticRequest(request))
})

// Static request handler
async function handleStaticRequest(request) {
  try {
    const staticCache = await caches.open(STATIC_CACHE)

    // Try network first for better performance
    try {
      const response = await fetch(request, { timeout: 5000 })
      if (response.ok) {
        // Cache successful responses
        const responseClone = response.clone()
        staticCache.put(request, responseClone).catch(() => {}) // Don't block on cache errors
        return response
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (fetchError) {
      console.warn("Service Worker: Network request failed, trying cache:", fetchError.message)

      // Try cache as fallback
      const cachedResponse = await staticCache.match(request)
      if (cachedResponse) {
        return cachedResponse
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

// Enhanced error handling for unhandled promise rejections
self.addEventListener("unhandledrejection", (event) => {
  console.error("Service Worker: Unhandled promise rejection:", event.reason)
  event.preventDefault()
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

console.log("Service Worker v8: Loaded with minimal API interference")
