// Production-grade Service Worker with Comprehensive Error Handling
const CACHE_NAME = "parking-angel-v6"
const STATIC_CACHE = "parking-angel-static-v6"
const ICON_CACHE = "parking-angel-icons-v6"
const API_CACHE = "parking-angel-api-v6"

// Essential files for offline functionality
const ESSENTIAL_FILES = ["/", "/dashboard", "/manifest.webmanifest", "/offline.html"]

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
]

// Install event with better error handling
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing v6 with enhanced error handling...")

  event.waitUntil(
    Promise.allSettled([
      // Cache essential files
      cacheEssentialFiles(),
      // Cache icon files
      cacheIconFiles(),
    ])
      .then((results) => {
        const failures = results.filter((result) => result.status === "rejected")
        if (failures.length > 0) {
          console.warn("Service Worker: Some resources failed to cache:", failures)
        }
        console.log("Service Worker: Installation complete")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("Service Worker: Installation failed:", error)
        // Continue anyway - don't block installation
        return self.skipWaiting()
      }),
  )
})

// Cache essential files with individual error handling
async function cacheEssentialFiles() {
  try {
    const cache = await caches.open(STATIC_CACHE)
    const results = await Promise.allSettled(
      ESSENTIAL_FILES.map(async (url) => {
        try {
          const response = await fetch(url)
          if (response.ok) {
            await cache.put(url, response)
            console.log(`Service Worker: Cached ${url}`)
          } else {
            console.warn(`Service Worker: Failed to cache ${url} - HTTP ${response.status}`)
          }
        } catch (error) {
          console.warn(`Service Worker: Error caching ${url}:`, error.message)
        }
      }),
    )
    return results
  } catch (error) {
    console.error("Service Worker: Error opening static cache:", error)
    throw error
  }
}

// Cache icon files with fallback generation
async function cacheIconFiles() {
  try {
    const cache = await caches.open(ICON_CACHE)

    // First, generate and cache fallback icons
    await generateAndCacheFallbackIcons(cache)

    // Then try to cache real icons
    const results = await Promise.allSettled(
      ICON_FILES.map(async (iconUrl) => {
        try {
          const response = await fetch(iconUrl)
          if (response.ok && response.headers.get("content-type")?.includes("image")) {
            await cache.put(iconUrl, response)
            console.log(`Service Worker: Cached icon ${iconUrl}`)
          } else {
            console.warn(`Service Worker: Invalid icon response for ${iconUrl}`)
          }
        } catch (error) {
          console.warn(`Service Worker: Error caching icon ${iconUrl}:`, error.message)
        }
      }),
    )
    return results
  } catch (error) {
    console.error("Service Worker: Error caching icons:", error)
    throw error
  }
}

// Generate fallback icons as SVG
async function generateAndCacheFallbackIcons(cache) {
  const iconSizes = [
    { size: 192, path: "/icon-192x192.png" },
    { size: 512, path: "/icon-512x512.png" },
    { size: 180, path: "/apple-touch-icon.png" },
    { size: 32, path: "/favicon-32x32.png" },
    { size: 16, path: "/favicon-16x16.png" },
  ]

  for (const { size, path } of iconSizes) {
    try {
      const svgIcon = generateSVGIcon(size)
      const response = new Response(svgIcon, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=31536000",
        },
      })
      await cache.put(path, response)
      console.log(`Service Worker: Generated fallback icon ${path}`)
    } catch (error) {
      console.warn(`Service Worker: Error generating fallback icon ${path}:`, error)
    }
  }
}

// Generate SVG icon
function generateSVGIcon(size) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.1}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">PA</text>
  </svg>`
}

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating v6...")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== ICON_CACHE &&
              cacheName !== API_CACHE &&
              cacheName.startsWith("parking-angel")
            ) {
              console.log("Service Worker: Deleting old cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: Activated v6")
        return self.clients.claim()
      })
      .catch((error) => {
        console.error("Service Worker: Activation error:", error)
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

  // Skip external domains that we don't want to cache
  if (EXTERNAL_DOMAINS.some((domain) => url.hostname.includes(domain))) {
    // Let external requests fail naturally without intervention
    return
  }

  // Handle different types of requests
  if (isIconRequest(url.pathname)) {
    event.respondWith(handleIconRequest(request))
  } else if (isApiRequest(url.pathname)) {
    event.respondWith(handleApiRequest(request))
  } else {
    event.respondWith(handleRegularRequest(request))
  }
})

// Icon request handler with guaranteed fallback
async function handleIconRequest(request) {
  const url = new URL(request.url)

  try {
    // Try cache first
    const iconCache = await caches.open(ICON_CACHE)
    const cachedIcon = await iconCache.match(request)

    if (cachedIcon) {
      console.log(`Service Worker: Serving cached icon: ${url.pathname}`)
      return cachedIcon
    }

    // Try to fetch the requested icon
    try {
      const response = await fetch(request, { timeout: 5000 })
      if (response.ok && response.headers.get("content-type")?.includes("image")) {
        const responseClone = response.clone()
        iconCache.put(request, responseClone).catch(() => {}) // Don't block on cache errors
        console.log(`Service Worker: Fetched and cached icon: ${url.pathname}`)
        return response
      }
    } catch (fetchError) {
      console.warn(`Service Worker: Fetch failed for icon ${url.pathname}:`, fetchError.message)
    }

    // Generate fallback icon
    console.log(`Service Worker: Generating fallback for ${url.pathname}`)
    return generateFallbackIconResponse(url.pathname)
  } catch (error) {
    console.error(`Service Worker: Error handling icon request for ${url.pathname}:`, error)
    return generateFallbackIconResponse(url.pathname)
  }
}

// Generate fallback icon response
function generateFallbackIconResponse(pathname) {
  // Determine size from pathname
  let size = 192
  if (pathname.includes("512")) size = 512
  else if (pathname.includes("180")) size = 180
  else if (pathname.includes("32")) size = 32
  else if (pathname.includes("16")) size = 16

  const svgIcon = generateSVGIcon(size)
  return new Response(svgIcon, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000",
    },
  })
}

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
function isIconRequest(pathname) {
  return (
    pathname.includes("apple-touch-icon") ||
    pathname.includes("favicon") ||
    pathname.includes("icon-") ||
    pathname.endsWith(".ico") ||
    (pathname.endsWith(".png") && (pathname.includes("icon") || pathname.includes("favicon")))
  )
}

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

console.log("Service Worker v6: Loaded with comprehensive error handling and fallback icons")
