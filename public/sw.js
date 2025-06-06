// Comprehensive Service Worker with Icon Fallback System
const CACHE_NAME = "parking-angel-v4"
const STATIC_CACHE = "parking-angel-static-v4"
const ICON_CACHE = "parking-angel-icons-v4"

// Essential files for offline functionality
const ESSENTIAL_FILES = ["/", "/dashboard", "/manifest.webmanifest", "/manifest.json"]

// All icon files for comprehensive caching
const ICON_FILES = [
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/apple-touch-icon-152x152.png",
  "/apple-touch-icon-180x180.png",
  "/apple-touch-icon-167x167.png",
  "/apple-touch-icon-precomposed.png",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/icon-maskable-192x192.png",
  "/icon-maskable-512x512.png",
]

// Install event - cache all essential files and icons
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing with comprehensive icon support...")

  event.waitUntil(
    Promise.all([
      // Cache essential files
      caches
        .open(STATIC_CACHE)
        .then((cache) => {
          console.log("Service Worker: Caching essential files")
          return cache.addAll(ESSENTIAL_FILES).catch((error) => {
            console.warn("Service Worker: Some essential files failed to cache", error)
          })
        }),

      // Cache all icon files
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
    ])
      .then(() => {
        console.log("Service Worker: Installation complete with icon fallback system")
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
            if (cacheName !== STATIC_CACHE && cacheName !== ICON_CACHE && cacheName.startsWith("parking-angel")) {
              console.log("Service Worker: Deleting old cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: Activated with icon fallback system")
        return self.clients.claim()
      }),
  )
})

// Fetch event with comprehensive icon fallback
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET requests
  if (request.method !== "GET") {
    return
  }

  // Special handling for icon requests
  if (url.pathname.includes("apple-touch-icon") || url.pathname.includes("icon-")) {
    event.respondWith(handleIconRequest(request))
    return
  }

  // Regular fetch handling
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200 && request.method === "GET") {
            const responseClone = response.clone()
            const cacheToUse = url.pathname.includes("icon") ? ICON_CACHE : STATIC_CACHE

            caches
              .open(cacheToUse)
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
          return caches.match(request)
        })
    }),
  )
})

// Icon request handler with fallback system
async function handleIconRequest(request) {
  const url = new URL(request.url)

  try {
    // Try to get from icon cache first
    const iconCache = await caches.open(ICON_CACHE)
    const cachedIcon = await iconCache.match(request)

    if (cachedIcon) {
      console.log(`Service Worker: Serving cached icon: ${url.pathname}`)
      return cachedIcon
    }

    // Try to fetch the requested icon
    const response = await fetch(request)
    if (response.ok) {
      // Cache the successful response
      const responseClone = response.clone()
      iconCache.put(request, responseClone)
      console.log(`Service Worker: Fetched and cached icon: ${url.pathname}`)
      return response
    }

    // Fallback to default icon if specific icon fails
    console.warn(`Service Worker: Icon not found, using fallback: ${url.pathname}`)
    return await getFallbackIcon(url.pathname, iconCache)
  } catch (error) {
    console.error(`Service Worker: Error handling icon request for ${url.pathname}:`, error)

    // Final fallback
    const iconCache = await caches.open(ICON_CACHE)
    return await getFallbackIcon(url.pathname, iconCache)
  }
}

// Fallback icon system
async function getFallbackIcon(requestedPath, iconCache) {
  const fallbackOrder = ["/apple-touch-icon.png", "/icon-192x192.png", "/icon-512x512.png", "/favicon.ico"]

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

  // Ultimate fallback - return a minimal response
  console.warn("Service Worker: No fallback icons available, returning minimal response")
  return new Response("", { status: 404, statusText: "Icon not found" })
}

// Push notification event
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push notification received")

  const title = "Parking Angel"
  const options = {
    body: "New parking update available!",
    icon: "/apple-touch-icon.png",
    badge: "/favicon.ico",
    tag: "parking-update",
    data: {
      url: "/dashboard",
    },
    actions: [
      {
        action: "view",
        title: "View Details",
        icon: "/icon-192x192.png",
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
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus()
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    }),
  )
})

console.log("Service Worker: Loaded with comprehensive icon fallback system")
