// Enhanced Service Worker v9 - Fixes Cache API errors and improves reliability
const CACHE_NAME = "parking-angel-v9"
const STATIC_CACHE = "parking-angel-static-v9"
const API_CACHE = "parking-angel-api-v9"

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

// Cache management utilities
class CacheManager {
  static async safeKeys(cache) {
    try {
      return await cache.keys()
    } catch (error) {
      console.warn("Cache keys() failed, attempting recovery:", error.message)
      // Try to recover by clearing the problematic cache
      try {
        const cacheName = cache.constructor.name
        await caches.delete(cacheName)
        console.log("Cleared problematic cache, creating new one")
        return []
      } catch (recoveryError) {
        console.error("Cache recovery failed:", recoveryError)
        return []
      }
    }
  }

  static async safeMatch(cache, request) {
    try {
      return await cache.match(request)
    } catch (error) {
      console.warn("Cache match() failed:", error.message)
      return null
    }
  }

  static async safePut(cache, request, response) {
    try {
      // Clone the response before caching
      const responseClone = response.clone()
      await cache.put(request, responseClone)
      return true
    } catch (error) {
      console.warn("Cache put() failed:", error.message)
      return false
    }
  }

  static async safeDelete(cache, request) {
    try {
      return await cache.delete(request)
    } catch (error) {
      console.warn("Cache delete() failed:", error.message)
      return false
    }
  }

  static async cleanupCache(cacheName, maxEntries = 50) {
    try {
      const cache = await caches.open(cacheName)
      const keys = await this.safeKeys(cache)

      if (keys.length > maxEntries) {
        const keysToDelete = keys.slice(0, keys.length - maxEntries)
        await Promise.all(keysToDelete.map((key) => this.safeDelete(cache, key)))
        console.log(`Cleaned up ${keysToDelete.length} entries from ${cacheName}`)
      }
    } catch (error) {
      console.error("Cache cleanup failed:", error)
    }
  }
}

// Install event with better error handling
self.addEventListener("install", (event) => {
  console.log("Service Worker v9: Installing...")

  event.waitUntil(
    (async () => {
      try {
        // Clear any existing problematic caches
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames
            .filter((name) => name.startsWith("parking-angel") && name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        )

        const cache = await caches.open(CACHE_NAME)

        // Cache essential files with individual error handling
        const cachePromises = ESSENTIAL_FILES.map(async (file) => {
          try {
            const response = await fetch(file)
            if (response.ok) {
              await CacheManager.safePut(cache, file, response)
            }
          } catch (error) {
            console.warn(`Failed to cache ${file}:`, error.message)
          }
        })

        await Promise.allSettled(cachePromises)
        console.log("Service Worker v9: Installation complete")
        return self.skipWaiting()
      } catch (error) {
        console.error("Service Worker v9: Installation failed", error)
        throw error
      }
    })(),
  )
})

// Activate event with comprehensive cleanup
self.addEventListener("activate", (event) => {
  console.log("Service Worker v9: Activating...")

  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys()

        // Delete old caches
        await Promise.all(
          cacheNames.map(async (cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith("parking-angel")) {
              console.log("Service Worker v9: Deleting old cache", cacheName)
              try {
                await caches.delete(cacheName)
              } catch (error) {
                console.warn("Failed to delete cache:", cacheName, error.message)
              }
            }
          }),
        )

        // Clean up current cache
        await CacheManager.cleanupCache(CACHE_NAME)

        console.log("Service Worker v9: Activated")
        return self.clients.claim()
      } catch (error) {
        console.error("Service Worker v9: Activation failed", error)
        throw error
      }
    })(),
  )
})

// Enhanced fetch event with better error handling
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // CRITICAL: Never intercept Supabase requests
  if (SUPABASE_DOMAINS.some((domain) => url.hostname.includes(domain))) {
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

  // Skip API routes
  if (url.pathname.startsWith("/api/")) {
    return
  }

  // Skip icon requests that might cause cache issues
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

  // Handle static requests with enhanced error handling
  event.respondWith(handleStaticRequestSafely(request))
})

// Enhanced static request handler
async function handleStaticRequestSafely(request) {
  try {
    const staticCache = await caches.open(STATIC_CACHE)

    // Try cache first with safe operations
    const cachedResponse = await CacheManager.safeMatch(staticCache, request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Try network with timeout
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(request, {
        signal: controller.signal,
        cache: "no-cache",
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        // Cache successful responses safely
        await CacheManager.safePut(staticCache, request, response)
        return response
      }
    } catch (fetchError) {
      console.warn("Service Worker v9: Network request failed:", fetchError.message)
    }

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      const offlinePage = await CacheManager.safeMatch(staticCache, "/offline.html")
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
    console.error("Service Worker v9: Request handling error:", error)
    return new Response("Internal Error", {
      status: 500,
      statusText: "Internal Server Error",
      headers: { "Content-Type": "text/plain" },
    })
  }
}

// Enhanced push notification handling
self.addEventListener("push", (event) => {
  console.log("Service Worker v9: Push notification received")

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
        console.warn("Service Worker v9: Error parsing push data:", parseError)
      }
    }

    event.waitUntil(
      self.registration
        .showNotification(title, options)
        .catch((error) => console.error("Service Worker v9: Notification error:", error)),
    )
  } catch (error) {
    console.error("Service Worker v9: Push event error:", error)
  }
})

// Enhanced notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker v9: Notification clicked")

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
        .catch((error) => console.error("Service Worker v9: Client handling error:", error)),
    )
  } catch (error) {
    console.error("Service Worker v9: Notification click error:", error)
  }
})

// Cache cleanup on message
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEANUP_CACHE") {
    event.waitUntil(
      (async () => {
        try {
          await CacheManager.cleanupCache(CACHE_NAME)
          await CacheManager.cleanupCache(STATIC_CACHE)
          console.log("Service Worker v9: Cache cleanup completed")
        } catch (error) {
          console.error("Service Worker v9: Cache cleanup failed:", error)
        }
      })(),
    )
  }
})

console.log("Service Worker v9: Loaded with enhanced cache management and error handling")
