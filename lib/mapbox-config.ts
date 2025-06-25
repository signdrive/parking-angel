// Mapbox configuration to prevent telemetry and reduce network calls
import mapboxgl from 'mapbox-gl'

let configured = false

export function configureMapbox() {
  if (configured || typeof window === 'undefined') return
  
  try {
    // Set access token with telemetry disabled
    if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    }

    // Disable telemetry collection at the global level
    if (typeof window !== 'undefined') {
      // Block telemetry before it starts
      const originalFetch = window.fetch
      window.fetch = function(url: string | URL | Request, options?: RequestInit) {
        const urlStr = typeof url === 'string' ? url : url.toString()
        
        // Block all Mapbox telemetry endpoints
        if (urlStr.includes('events.mapbox.com') || 
            urlStr.includes('api.mapbox.com/events') ||
            urlStr.includes('mapbox.com/events')) {
          console.log('Blocked Mapbox telemetry request to:', urlStr)
          return Promise.resolve(new Response('{"status":"blocked"}', { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }))
        }
        
        return originalFetch.call(this, url, options)
      }      // Also block via XMLHttpRequest
      const originalXHROpen = XMLHttpRequest.prototype.open
      XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
        const urlStr = typeof url === 'string' ? url : url.toString()
        if (urlStr.includes('events.mapbox.com') || 
            urlStr.includes('api.mapbox.com/events') ||
            urlStr.includes('mapbox.com/events')) {
          console.log('Blocked Mapbox telemetry XHR to:', urlStr)
          return
        }
        return originalXHROpen.call(this, method, url, async ?? true, user, password)
      }
    }
    
    // Set worker count to minimize resource usage
    if (typeof mapboxgl.workerCount !== 'undefined') {
      mapboxgl.workerCount = 1
    }
    
    configured = true
    console.log('Mapbox configuration applied - telemetry disabled')
  } catch (error) {
    console.warn('Failed to configure Mapbox:', error)
  }
}

// Auto-configure when imported
if (typeof window !== 'undefined') {
  configureMapbox()
}
