// Simple and reliable service worker
const CACHE_NAME = "parking-angel-v2"
const STATIC_CACHE = "parking-angel-static-v2"

// Only cache essential files that we know exist
const ESSENTIAL_FILES = ["/", "/dashboard", "/manifest.json"]

// Install event - cache only essential files
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Service Worker: Caching essential files")
        // Cache files one by one to handle failures gracefully
        return Promise.allSettled(
          ESSENTIAL_FILES.map((url) =>
            fetch(url)
              .then((response) => {
                if (response.ok) {
                  return cache.put(url, response)
                }
                console.warn(`Service Worker: Failed to cache ${url}`)
              })
              .catch((error) => {
                console.warn(`Service Worker: Error caching ${url}:`, error)
              }),
          ),
        )
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

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName.startsWith("parking-angel")) {
              console.log("Service Worker: Deleting old cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: Activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - only cache GET requests
self.addEventListener("fetch", (event) => {
  const { request } = event

  // Only handle GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip caching for API requests that change data
  if (
    request.url.includes("/api/") &&
    (request.url.includes("POST") || request.url.includes("PATCH") || request.url.includes("DELETE"))
  ) {
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request)
        .then((response) => {
          // Only cache successful GET responses
          if (response.status === 200 && request.method === "GET") {
            const responseClone = response.clone()
            caches
              .open(STATIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone)
              })
              .catch((error) => {
                console.warn("Service Worker: Cache put failed", error)
              })
          }
          return response
        })
        .catch((error) => {
          console.warn("Service Worker: Fetch failed", error)
          // Return cached version if available
          return caches.match(request)
        })
    }),
  )
})

// Push notification event
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push notification received")

  const title = "Parking Angel"
  const options = {
    body: "New parking update available!",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: "parking-update",
  }

  if (event.data) {
    try {
      const payload = event.data.json()
      options.body = payload.body || options.body
      options.data = payload.data || {}
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

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes("/dashboard") && "focus" in client) {
          return client.focus()
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow("/dashboard")
      }
    }),
  )
})

console.log("Service Worker: Loaded successfully")
