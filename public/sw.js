// Minimal service worker with no icon references
const CACHE_NAME = "parking-angel-v3"

// Only cache essential files - NO ICONS
const ESSENTIAL_FILES = ["/", "/dashboard"]

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching essential files")
        return cache.addAll(ESSENTIAL_FILES)
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
  console.log("Service Worker: Activating...")

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
        console.log("Service Worker: Activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - simple caching
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") {
    return
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request)
      })
      .catch(() => {
        // Return cached version if available
        return caches.match(event.request)
      }),
  )
})

// Push notification event - NO ICON REFERENCES
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push notification received")

  const title = "Parking Angel"
  const options = {
    body: "New parking update available!",
    tag: "parking-update",
    // NO ICON OR BADGE PROPERTIES
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
      for (const client of clientList) {
        if (client.url.includes("/dashboard") && "focus" in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/dashboard")
      }
    }),
  )
})

console.log("Service Worker: Loaded successfully - NO ICONS")
