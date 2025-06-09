// Fixed Service Worker v8 - Resolves 406 errors and Supabase interference
const CACHE_NAME = "parking-angel-v8"
const STATIC_CACHE = "parking-angel-static-v8"
const API_CACHE = "parking-angel-api-v8"

// Essential files for offline functionality
const ESSENTIAL_FILES = ["/", "/dashboard", "/offline.html"]

// Supabase domains to NEVER intercept
const SUPABASE_DOMAINS = ["supabase.co", "supabase.com", "vzhvpecwnjssurxbyzph.supabase.co"]

// External domains to ignore completely
const EXTERNAL_DOMAINS = [
  "googletagmanager.com",
  "google-analytics.com",
  "googleapis.com",
  "googleusercontent.com",
  "gstatic.com",
  "mapbox.com",
  "mapbox.gl",
]

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker v8: Installing...")

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker v8: Caching essential files")
        return cache.addAll(ESSENTIAL_FILES).catch((error) => {
          console.warn("Service Worker v8: Some files failed to cache", error)
        })
      })
      .then(() => {
        console.log("Service Worker v8: Installation complete")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("Service Worker v8: Installation failed", error)
      }),
  )
})

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker v8: Activating...")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith("parking-angel")) {
              console.log("Service Worker v8: Deleting old cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker v8: Activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event with Supabase exclusion
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // CRITICAL: Never intercept Supabase requests
  if (SUPABASE_DOMAINS.some((domain) => url.hostname.includes(domain))) {
    console.log("Service Worker v8: Allowing Supabase request to pass through:", url.pathname)
    return // Let Supabase requests go directly to the server
  }

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip external domains
  if (EXTERNAL_DOMAINS.some((domain) => url.hostname.includes(domain))) {
    return
  }

  // Skip API routes (let them go to our Next.js API)
  if (url.pathname.startsWith("/api/")) {
    return
  }

  // Skip icon requests
  if (
    url.pathname.includes("icon") ||
    url.pathname.includes("favicon") ||
    url.pathname.includes("apple-touch") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.includes("manifest")
  ) {
    return
  }

  // Only handle static assets and pages
  event.respondWith(handleStaticRequest(request))
})

// Handle static requests only
async function handleStaticRequest(request) {
  try {
    const staticCache = await caches.open(STATIC_CACHE)

    // Try cache first
    const cachedResponse = await staticCache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Try network
    try {
      const response = await fetch(request, { timeout: 5000 })
      if (response.ok) {
        // Cache successful responses
        const responseClone = response.clone()
        staticCache.put(request, responseClone).catch(() => {})
        return response
      }
    } catch (fetchError) {
      console.warn("Service Worker v8: Network request failed:", fetchError.message)
    }

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      const offlinePage = await staticCache.match("/offline.html")
      if (offlinePage) {
        return offlinePage
      }
    }

    // Return a basic error response
    return new Response("Service Unavailable", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain" },
    })
  } catch (error) {
    console.error("Service Worker v8: Request handling error:", error)
    return new Response("Internal Error", {
      status: 500,
      statusText: "Internal Server Error",
      headers: { "Content-Type": "text/plain" },
    })
  }
}

// Push notification handling
self.addEventListener("push", (event) => {
  console.log("Service Worker v8: Push notification received")

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
        console.warn("Service Worker v8: Error parsing push data:", parseError)
      }
    }

    event.waitUntil(
      self.registration
        .showNotification(title, options)
        .catch((error) => console.error("Service Worker v8: Notification error:", error)),
    )
  } catch (error) {
    console.error("Service Worker v8: Push event error:", error)
  }
})

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker v8: Notification clicked")

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
        .catch((error) => console.error("Service Worker v8: Client handling error:", error)),
    )
  } catch (error) {
    console.error("Service Worker v8: Notification click error:", error)
  }
})

console.log("Service Worker v8: Loaded with Supabase exclusion")
