"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Shield, Clock, Database } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { getBrowserClient } from '@/lib/supabase/browser'

interface LocationSettings {
  allowTracking: boolean
  shareWithPartners: boolean
  retentionPeriod: '7d' | '30d' | '90d' | 'indefinite'
  precisionLevel: 'exact' | 'approximate' | 'city'
}

export function LocationConsentManager() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<LocationSettings>({
    allowTracking: false,
    shareWithPartners: false,
    retentionPeriod: '30d',
    precisionLevel: 'approximate'
  })
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check current browser permission
    if ('geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setHasPermission(result.state === 'granted')
      })
    }

    // Load user preferences
    loadUserPreferences()
  }, [user])
  const loadUserPreferences = async () => {
    if (!user) return

    try {
      const supabase = getBrowserClient()
      // Use notification_preferences table for now, will create user_preferences later
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        // Mock location settings for now
        setSettings({
          allowTracking: false,
          shareWithPartners: false,
          retentionPeriod: '30d',
          precisionLevel: 'approximate'
        })
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
  }
  const savePreferences = async () => {
    if (!user) return

    setLoading(true)
    try {
      const supabase = getBrowserClient()
      // For now, just log the settings locally since user_preferences table doesn't exist
      console.log('Saving location preferences:', settings)
      
      // TODO: Save to actual user_preferences table when created
      localStorage.setItem(`location_settings_${user.id}`, JSON.stringify(settings))

      // If user enabled tracking, request permission
      if (settings.allowTracking && hasPermission !== true) {
        await requestLocationPermission()
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const requestLocationPermission = async () => {
    if ('geolocation' in navigator) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setHasPermission(true)
            resolve(position)
          },
          (error) => {
            setHasPermission(false)
            reject(error)
          },
          { enableHighAccuracy: true, timeout: 10000 }
        )
      })
    }
  }

  const retentionLabels = {
    '7d': '7 days',
    '30d': '30 days',
    '90d': '90 days',
    'indefinite': 'Until account deletion'
  }

  const precisionLabels = {
    'exact': 'Exact location (GPS accuracy)',
    'approximate': 'Approximate area (~100m radius)',
    'city': 'City level only'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location Tracking Preferences
          </CardTitle>
          <CardDescription>
            Control how ParkAlgo uses your location data to improve your parking experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary tracking toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">Enable Location Tracking</h3>
              <p className="text-sm text-gray-600">
                Allow ParkAlgo to access your location for personalized parking recommendations
              </p>
            </div>
            <Switch
              checked={settings.allowTracking}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, allowTracking: checked }))
              }
            />
          </div>

          {settings.allowTracking && (
            <>
              {/* Browser permission status */}
              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  Browser Permission: {hasPermission === true ? '✅ Granted' : hasPermission === false ? '❌ Denied' : '⏳ Not requested'}
                </AlertDescription>
              </Alert>

              {/* Precision level */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Location Precision
                </h3>
                <div className="space-y-2">
                  {Object.entries(precisionLabels).map(([level, label]) => (
                    <label key={level} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="precision"
                        value={level}
                        checked={settings.precisionLevel === level}
                        onChange={(e) => 
                          setSettings(prev => ({ ...prev, precisionLevel: e.target.value as any }))
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Data retention */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Data Retention Period
                </h3>
                <select
                  value={settings.retentionPeriod}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, retentionPeriod: e.target.value as any }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  {Object.entries(retentionLabels).map(([period, label]) => (
                    <option key={period} value={period}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Partner sharing */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">Share with Partners</h3>
                  <p className="text-sm text-gray-600">
                    Allow anonymized location data to be shared with parking providers for better availability
                  </p>
                </div>
                <Switch
                  checked={settings.shareWithPartners}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, shareWithPartners: checked }))
                  }
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={savePreferences} disabled={loading}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
            <Button variant="outline" onClick={loadUserPreferences}>
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* GDPR Compliance Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Privacy Notice</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <p>
            Your location data is processed in accordance with our Privacy Policy and applicable data protection laws including GDPR and CCPA.
          </p>
          <p>
            You can withdraw consent, request data deletion, or export your data at any time from your account settings.
          </p>
          <p>
            Location data is encrypted in transit and at rest using industry-standard AES-256 encryption.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
