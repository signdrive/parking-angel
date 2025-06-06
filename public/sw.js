const CACHE_NAME = "parking-angel-v1"
const STATIC_CACHE = "parking-angel-static-v1"
const DYNAMIC_CACHE = "parking-angel-dynamic-v1"

// Files to cache immediately
const STATIC_FILES = [
  "/",
  "/dashboard",
  "/auth/login",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/offline.html",
]

// API endpoints to cache
const API_CACHE_PATTERNS = [/^https:\/\/api\.mapbox\.com/, /^.*\/api\/spots/, /^.*\/api\/parking/]

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Service Worker: Caching static files")
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log("Service Worker: Static files cached")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("Service Worker: Error caching static files", error)
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
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
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

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone))
          }
          return response
        })
        .catch(() => {
          // Serve cached page or offline page
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match("/offline.html")
          })
        }),
    )
    return
  }

  // Handle API requests
  if (url.pathname.startsWith("/api/") || API_CACHE_PATTERNS.some((pattern) => pattern.test(request.url))) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Cache successful API responses
            if (response.status === 200) {
              cache.put(request, response.clone())
            }
            return response
          })
          .catch(() => {
            // Serve from cache if network fails
            return cache.match(request)
          })
      }),
    )
    return
  }

  // Handle static assets
  event.respondWith(
    caches
      .match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(request).then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone))
          }
          return response
        })
      })
      .catch(() => {
        // Fallback for images
        if (request.destination === "image") {
          return caches.match("/icon-192x192.png")
        }
      }),
  )
})

// Push notification event
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push notification received", event)

  let notificationData = {
    title: "Parking Angel",
    body: "You have a new parking update!",
    icon: "/icon-192x192.png",
    badge: "/icon-96x96.png",
    tag: "parking-update",
    requireInteraction: true,
    actions: [
      {
        action: "view",
        title: "View Details",
        icon: "/icon-72x72.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
    data: {
      url: "/dashboard",
    },
  }

  if (event.data) {
    try {
      const payload = event.data.json()
      notificationData = {
        ...notificationData,
        ...payload.notification,
        data: { ...notificationData.data, ...payload.data },
      }
    } catch (error) {
      console.error("Service Worker: Error parsing push data", error)
    }
  }

  event.waitUntil(self.registration.showNotification(notificationData.title, notificationData))
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked", event)

  event.notification.close()

  const action = event.action
  const data = event.notification.data || {}

  let url = data.url || "/dashboard"

  if (action === "view") {
    url = data.actionUrl || url
  } else if (action === "dismiss") {
    return // Just close the notification
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(url.split("?")[0]) && "focus" in client) {
          return client.focus()
        }
      }

      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    }),
  )
})

// Background sync event
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync", event.tag)

  if (event.tag === "parking-data-sync") {
    event.waitUntil(syncParkingData())
  }
})

// Sync parking data in background
async function syncParkingData() {
  try {
    console.log("Service Worker: Syncing parking data...")

    // Sync user's parking sessions
    const response = await fetch("/api/sync/parking-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (response.ok) {
      console.log("Service Worker: Parking data synced successfully")

      // Notify all clients about the sync
      const clients = await self.clients.matchAll()
      clients.forEach((client) => {
        client.postMessage({
          type: "PARKING_DATA_SYNCED",
          timestamp: Date.now(),
        })
      })
    }
  } catch (error) {
    console.error("Service Worker: Error syncing parking data", error)
  }
}

// Periodic background sync (if supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "parking-updates") {
    event.waitUntil(syncParkingData())
  }
})

// Handle messages from main thread
self.addEventListener("message", (event) => {
  console.log("Service Worker: Message received", event.data)

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})
