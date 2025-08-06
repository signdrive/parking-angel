// Park Algo Service Worker - Optimized
const CACHE_NAME = "park-algo-v15";
const STATIC_CACHE = "park-algo-static-v15";

// Don't cache in development mode
const isDevelopment = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// Suppress service worker update notifications in DevTools
if (isDevelopment) {
  console.warn = () => {} // Suppress SW warnings in dev
}

// Skip waiting and activate immediately in development
if (isDevelopment) {
  self.addEventListener('install', event => {
    console.log('SW: Development mode - skipping wait');
    self.skipWaiting();
  });
}

// Essential files for offline functionality
const ESSENTIAL_FILES = [
  "/",
  "/dashboard",
  "/offline.html",
  "/favicon.ico",
  "/manifest.json"
];

// URLs that should never be cached
const NO_CACHE_URLS = [
  "/api/",
  "supabase.co",
  "accounts.google.com",
  "googleapis.com",
  "stripe.com",
  "googletagmanager.com"
];

// Regex for Next.js static assets
const NEXT_STATIC_REGEX = /_next\/static\/.+\.(js|css|woff2?|svg|png|jpg|jpeg|gif|ico)$/;

// Check if a URL should be cached
const shouldCache = (url) => {
  // Don't cache anything in development
  if (isDevelopment) return false;
  
  const urlObj = new URL(url);
  // Always cache Next.js static assets
  if (NEXT_STATIC_REGEX.test(urlObj.pathname)) return true;
  // Don't cache blacklisted URLs
  if (NO_CACHE_URLS.some(nocache => url.includes(nocache))) return false;
  // Cache other static assets and essential files
  return true;
};

// Network-first fetch with fallback to cache
const networkFirst = async (request) => {
  try {
    const response = await fetch(request);
    // Cache successful responses
    if (response.ok && shouldCache(request.url)) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || await caches.match('/offline.html');
  }
};

// Cache-first fetch for static assets
const cacheFirst = async (request) => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Failed to fetch', { status: 408 });
  }
};

// Install event - cache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ESSENTIAL_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              (cacheName.startsWith("park-algo") && 
               ![CACHE_NAME, STATIC_CACHE].includes(cacheName)))
            .map(cacheName => caches.delete(cacheName))
        );
      }),
      self.clients.claim() // Take control of all clients
    ])
  );
});

// Fetch event - handle all requests
self.addEventListener("fetch", (event) => {
  // Ignore non-GET requests and blacklisted URLs
  if (event.request.method !== 'GET' || 
      NO_CACHE_URLS.some(url => event.request.url.includes(url))) {
    return;
  }

  // Use cache-first for Next.js static assets
  if (NEXT_STATIC_REGEX.test(new URL(event.request.url).pathname)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Use network-first for everything else
  event.respondWith(networkFirst(event.request));
});