// Production-grade Service Worker with Comprehensive Error Handling
const CACHE_NAME = "parking-angel-v8" // Incremented cache version
const STATIC_CACHE = "parking-angel-static-v8"
const ICON_CACHE = "parking-angel-icons-v8"
const API_CACHE = "parking-angel-api-v8"

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

// External domains to ignore (don't cache AND let pass through directly)
const EXTERNAL_DOMAINS_TO_BYPASS = [
  "api.mapbox.com", // CRITICAL: Let Mapbox API calls pass through directly
  "events.mapbox.com",
  "googletagmanager.com",
  "google-analytics.com",
  "googleapis.com",
  "googleusercontent.com",
  "gstatic.com",
]

// Install event with minimal caching
self.addEventListener("install", (event) => {
  console.log(`Service Worker: Installing ${CACHE_NAME}...`)

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
  console.log(`Service Worker: Activating ${CACHE_NAME}...`)

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE && // Keep new static cache
              cacheName !== API_CACHE && // Keep new API cache
              cacheName.startsWith("parking-angel")
            ) {
              console.log("Service Worker: Deleting old cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log(`Service Worker: Activated ${CACHE_NAME}`)
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
    // console.log("Service Worker: Skipping non-GET request:", request.method, request.url);
    return
  }

  // CRITICAL: Bypass Service Worker for Mapbox API calls and other specified external domains
  if (EXTERNAL_DOMAINS_TO_BYPASS.some((domain) => url.hostname.includes(domain))) {
    // console.log("Service Worker: Bypassing for external domain:", request.url);
    return // Let the browser handle it directly
  }

  // DO NOT INTERCEPT ICON REQUESTS - let them go directly to the server
  if (
    url.pathname.includes("icon") ||
    url.pathname.includes("favicon") ||
    url.pathname.includes("apple-touch") ||
    url.pathname.endsWith(".png") || // More general rule for images
    url.pathname.endsWith(".ico") ||
    url.pathname.includes("manifest")
  ) {
    // console.log("Service Worker: Bypassing for icon/manifest:", request.url);
    return // Let these requests go through normally
  }

  // Handle different types of requests
  if (isApiRequest(url.pathname)) {
    // console.log("Service Worker: Handling API request:", request.url);
    event.respondWith(handleApiRequest(request))
  } else {
    // console.log("Service Worker: Handling regular request:", request.url);
    event.respondWith(handleRegularRequest(request))
  }
})

// API request handler with better error handling
async function handleApiRequest(request) {
  try {
    const apiCache = await caches.open(API_CACHE)

    // Try network first for fresh data
    try {
      const response = await fetch(request, { timeout: 10000 }) // Added timeout
      if (response.ok) {
        const responseClone = response.clone()
        apiCache.put(request, responseClone).catch((cacheError) => {
          console.warn("Service Worker: API Cache put failed", cacheError)
        })
        return response
      }
      // If response is not ok, but it's a valid HTTP response, still return it
      // This allows the client to handle specific API errors (like 4xx)
      // console.warn(`Service Worker: API request to ${request.url} returned status ${response.status}`);
      return response
    } catch (fetchError) {
      console.warn("Service Worker: API fetch failed, trying cache:", fetchError.message)
    }

    // Fallback to cache
    const cachedResponse = await apiCache.match(request)
    if (cachedResponse) {
      // console.log("Service Worker: Serving cached API response for", request.url);
      return cachedResponse
    }

    // console.warn("Service Worker: API request failed and not in cache for", request.url);
    // Return offline response for API failures if not found in cache
    return new Response(
      JSON.stringify({
        error: "Offline or API unreachable",
        message: "This feature is not available offline and the server could not be reached.",
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
        message: "An error occurred processing your API request",
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
      // Serve from cache and update in background (stale-while-revalidate)
      updateCacheInBackground(request, staticCache)
      return cachedResponse
    }

    // Try network
    try {
      const response = await fetch(request, { timeout: 10000 }) // Added timeout
      if (response.ok) {
        // Cache successful responses
        const responseClone = response.clone()
        staticCache.put(request, responseClone).catch((cacheError) => {
          console.warn("Service Worker: Static Cache put failed", cacheError)
        })
        return response
      } else {
        // console.warn(`Service Worker: HTTP ${response.status} for ${request.url}`);
        // Don't throw an error here, let the offline fallback handle it if it's a navigation request
        // For other assets, this non-ok response will be returned.
        if (request.mode === "navigate") {
          throw new Error(`HTTP ${response.status}`) // Force fallback for navigation
        }
        return response // Return non-ok response for non-navigation assets
      }
    } catch (fetchError) {
      // console.warn("Service Worker: Network request failed for", request.url, ":", fetchError.message);

      // Try cache again as final fallback (might have been populated by another tab)
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

      // Return a proper error response instead of throwing for non-navigation assets
      return new Response("Network error and resource not in cache.", {
        status: 404, // Or 503
        statusText: "Not Found or Network Error",
        headers: { "Content-Type": "text/plain" },
      })
    }
  } catch (error) {
    console.error("Service Worker: Request handling error:", error)
    // Fallback for truly unexpected errors
    const offlinePage = await caches.match("/offline.html", { cacheName: CACHE_NAME }) // Check main cache
    if (offlinePage) return offlinePage

    return new Response("Internal Error in Service Worker", {
      status: 500,
      statusText: "Internal Server Error",
      headers: { "Content-Type": "text/plain" },
    })
  }
}

// Background cache update
async function updateCacheInBackground(request, cache) {
  try {
    const response = await fetch(request, { timeout: 5000 }) // Shorter timeout for background
    if (response.ok) {
      await cache.put(request, response)
    }
  } catch (error) {
    // Silently fail background updates
    // console.warn("Service Worker: Background update failed:", error.message);
  }
}

// Utility functions
function isApiRequest(pathname) {
  return pathname.startsWith("/api/")
}

// Enhanced error handling for unhandled promise rejections
self.addEventListener("unhandledrejection", (event) => {
  console.error("Service Worker: Unhandled promise rejection:", event.reason)
  // Optional: Prevent default browser handling if you have specific recovery
  // event.preventDefault();
})

// Enhanced error handling for general errors
self.addEventListener("error", (event) => {
  console.error("Service Worker: General error:", event.error, event.message)
})

// Push notification event with error handling
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push notification received")

  try {
    const title = "Parking Angel"
    const options = {
      // Ensure data type is compatible
      body: "New parking update available!",
      icon: "/icon-192x192.png",
      badge: "/favicon.ico",
      tag: "parking-update",
      data: { url: "/dashboard" }, // Ensure data is structured as expected
      requireInteraction: false,
      silent: false,
    }

    if (event.data) {
      try {
        const payload = event.data.json()
        options.body = payload.body || options.body
        // Merge data carefully, ensuring url is preserved or updated correctly
        options.data = { ...options.data, ...payload.data }
      } catch (parseError) {
        console.warn("Service Worker: Error parsing push data:", parseError)
        // Fallback to text if JSON parsing fails
        options.body = event.data.text() || options.body
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

console.log(`Service Worker ${CACHE_NAME}: Loaded and ready. Mapbox requests will be bypassed.`)
