"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Shield, Settings, Save, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { SiteFooter } from "@/components/layout/site-footer"
import { useConsent } from "@/hooks/use-consent"

interface ConsentPreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

export default function ConsentSettingsPage() {
  const { getConsent, updateConsent } = useConsent()
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  })
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Load current consent preferences
    const currentConsent = getConsent()
    if (currentConsent) {
      setPreferences(currentConsent)
    }

    // Get last updated date
    const consentDate = localStorage.getItem('park-algo-consent-date')
    if (consentDate) {
      setLastUpdated(consentDate)
    }
  }, [getConsent])

  const togglePreference = (key: keyof ConsentPreferences) => {
    if (key === 'necessary') return // Can't disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      updateConsent(preferences)
      setLastUpdated(new Date().toISOString())
      // Show success feedback
      setTimeout(() => {
        setIsSaving(false)
      }, 500)
    } catch (error) {

      setIsSaving(false)
    }
  }

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    }
    setPreferences(allAccepted)
  }

  const handleDenyAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    }
    setPreferences(onlyNecessary)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cookie & Privacy Settings</h1>
              <p className="text-gray-600">Manage your data and privacy preferences</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">GDPR Compliant</Badge>
            <Badge variant="outline">CCPA Compliant</Badge>
            <Badge variant="outline">Privacy First</Badge>
            {lastUpdated && (
              <Badge variant="secondary">
                Last updated: {new Date(lastUpdated).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </div>

        {/* Overview */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Your Privacy Choices
            </CardTitle>
            <CardDescription>
              Control how we collect and use your data. You can change these preferences at any time.
              Your choices are automatically saved and respected across all Park Algo services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Why This Matters</h3>
              <p className="text-sm text-blue-800">
                We believe in transparency and your right to control your data. These settings help us provide
                you with the best experience while respecting your privacy preferences.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Categories */}
        <div className="space-y-6 mb-8">
          {/* Necessary Cookies */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  <div>
                    <CardTitle className="text-lg">Necessary Cookies</CardTitle>
                    <CardDescription>Essential for website functionality</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Always Active</Badge>
                  <Switch checked={true} disabled />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                These cookies are essential for the website to function properly and cannot be disabled.
                They are usually only set in response to actions made by you which amount to a request for services.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Examples:</strong> Login sessions, shopping cart, security features, form submissions
              </div>
            </CardContent>
          </Card>

          {/* Analytics Cookies */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded"></div>
                  <div>
                    <CardTitle className="text-lg">Analytics Cookies</CardTitle>
                    <CardDescription>Help us understand website usage</CardDescription>
                  </div>
                </div>
                <Switch 
                  checked={preferences.analytics}
                  onCheckedChange={() => togglePreference('analytics')}
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                These cookies help us understand how visitors interact with our website by collecting
                and reporting information anonymously. This helps us improve our services.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Examples:</strong> Google Analytics, page views, bounce rate, traffic sources
              </div>
            </CardContent>
          </Card>

          {/* Marketing Cookies */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-500 rounded"></div>
                  <div>
                    <CardTitle className="text-lg">Marketing Cookies</CardTitle>
                    <CardDescription>Personalized ads and content</CardDescription>
                  </div>
                </div>
                <Switch 
                  checked={preferences.marketing}
                  onCheckedChange={() => togglePreference('marketing')}
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                These cookies are used to deliver personalized advertisements and track the effectiveness
                of our advertising campaigns. They may be set by us or third-party providers.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Examples:</strong> Facebook Pixel, Google Ads, retargeting pixels, conversion tracking
              </div>
            </CardContent>
          </Card>

          {/* Functional Cookies */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-orange-500 rounded"></div>
                  <div>
                    <CardTitle className="text-lg">Functional Cookies</CardTitle>
                    <CardDescription>Enhanced features and personalization</CardDescription>
                  </div>
                </div>
                <Switch 
                  checked={preferences.functional}
                  onCheckedChange={() => togglePreference('functional')}
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                These cookies enable enhanced functionality and personalization features.
                They may be set by us or by third party providers whose services we use.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Examples:</strong> Language preferences, chat widgets, video players, social media features
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card className="shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                onClick={handleDenyAll}
                variant="outline"
                className="flex-1"
              >
                Deny All Optional
              </Button>
              <Button
                onClick={handleAcceptAll}
                variant="outline"
                className="flex-1"
              >
                Accept All
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Legal Information */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Your Rights & More Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Your Privacy Rights</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Right to access your data</li>
                  <li>• Right to rectification</li>
                  <li>• Right to erasure ("right to be forgotten")</li>
                  <li>• Right to data portability</li>
                  <li>• Right to object to processing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
                <ul className="text-sm space-y-2">
                  <li>
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Read our Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-blue-600 hover:underline">
                      Contact our support team
                    </Link>
                  </li>
                  <li>
                    <a href="mailto:privacy@parkalgo.com" className="text-blue-600 hover:underline">
                      Email our privacy team
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <SiteFooter />
    </div>
  )
}
