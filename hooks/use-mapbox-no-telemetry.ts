import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

let telemetryBlocked = false

// Define telemetry endpoints to block
const TELEMETRY_ENDPOINTS = [
  'events.mapbox.com',
  'api.mapbox.com/events',
  'mapbox.com/events',
  'api.mapbox.com/analytics'
]

// Helper function to check if URL is a telemetry endpoint
const isTelemetryUrl = (url: string | URL | Request): boolean => {
  const urlStr = typeof url === 'string' ? url : 
                 url instanceof URL ? url.toString() :
                 url.url || url.toString()
  
  return TELEMETRY_ENDPOINTS.some(endpoint => urlStr.includes(endpoint))
}

export function useMapboxNoTelemetry() {
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current || telemetryBlocked || typeof window === 'undefined') return

    try {
      // Set access token
      if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      }

      // Block fetch requests to telemetry endpoints
      const originalFetch = window.fetch
      window.fetch = function(url: string | URL | Request, options?: RequestInit) {
        if (isTelemetryUrl(url)) {
          console.log('🚫 Blocked Mapbox telemetry fetch:', typeof url === 'string' ? url : url.toString())
          return Promise.resolve(new Response(JSON.stringify({ blocked: true, success: true }), { 
            status: 200,
            statusText: 'OK',
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }))
        }
        
        return originalFetch.call(this, url, options)
      }

      // Block XMLHttpRequest to telemetry endpoints
      const originalXHROpen = XMLHttpRequest.prototype.open
      XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
        if (isTelemetryUrl(url)) {
          console.log('🚫 Blocked Mapbox telemetry XHR:', typeof url === 'string' ? url : url.toString())
          // Mark this XHR as blocked
          ;(this as any)._telemetryBlocked = true
          
          // Override properties to simulate successful response
          Object.defineProperty(this, 'readyState', { value: 4, configurable: true })
          Object.defineProperty(this, 'status', { value: 200, configurable: true })
          Object.defineProperty(this, 'statusText', { value: 'OK', configurable: true })
          Object.defineProperty(this, 'responseText', { value: JSON.stringify({ blocked: true, success: true }), configurable: true })
          Object.defineProperty(this, 'response', { value: JSON.stringify({ blocked: true, success: true }), configurable: true })
            // Trigger readystatechange event asynchronously
          setTimeout(() => {
            if (this.onreadystatechange) {
              const event = new Event('readystatechange') as any
              this.onreadystatechange.call(this, event)
            }
            if (this.onload) {
              const loadEvent = new ProgressEvent('load', {
                lengthComputable: true,
                loaded: 100,
                total: 100
              }) as any
              this.onload.call(this, loadEvent)
            }
          }, 0)
          
          return
        }
        
        return originalXHROpen.call(this, method, url, async ?? true, user, password)
      }

      // Block XMLHttpRequest send for telemetry
      const originalXHRSend = XMLHttpRequest.prototype.send
      XMLHttpRequest.prototype.send = function(body: any) {
        if ((this as any)._telemetryBlocked) {
          // Already blocked, don't actually send
          return
        }
        return originalXHRSend.call(this, body)
      }

      // Also override setRequestHeader for blocked requests
      const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader
      XMLHttpRequest.prototype.setRequestHeader = function(header: string, value: string) {
        if ((this as any)._telemetryBlocked) {
          // Silently ignore headers for blocked requests
          return
        }
        return originalSetRequestHeader.call(this, header, value)
      }

      telemetryBlocked = true
      initRef.current = true
      console.log('✅ Mapbox telemetry blocking enabled')

    } catch (error) {
      console.warn('Failed to block Mapbox telemetry:', error)
    }
  }, [])

  return { telemetryBlocked }
}
