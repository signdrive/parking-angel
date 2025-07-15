"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, MapPin, Clock, TrendingDown, Zap, Plus, Settings, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function SmartAlerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newAlert, setNewAlert] = useState({
    alert_type: 'spot_available',
    location: { lat: 51.5074, lng: -0.1278, address: 'Central London' },
    radius: 500,
    max_price: 5.00,
    notification_method: 'push'
  })

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/alerts?user_id=current_user')
      const data = await response.json()
      if (data.alerts) {
        setAlerts(data.alerts)
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const createAlert = async () => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newAlert,
          user_id: 'current_user'
        }),
      })
      
      const data = await response.json()
      if (data.success) {
        setShowCreateForm(false)
        setNewAlert({
          alert_type: 'spot_available',
          location: { lat: 51.5074, lng: -0.1278, address: 'Central London' },
          radius: 500,
          max_price: 5.00,
          notification_method: 'push'
        })
        loadAlerts()
      }
    } catch (error) {
      console.error('Error creating alert:', error)
    }
  }

  const deleteAlert = async (alertId: string) => {
    try {
      await fetch(`/api/alerts?alert_id=${alertId}`, {
        method: 'DELETE',
      })
      loadAlerts()
    } catch (error) {
      console.error('Error deleting alert:', error)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'spot_available': return <MapPin className="w-4 h-4" />
      case 'price_drop': return <TrendingDown className="w-4 h-4" />
      case 'leaving_soon': return <Clock className="w-4 h-4" />
      case 'peak_time_reminder': return <Zap className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'spot_available': return 'bg-blue-100 text-blue-800'
      case 'price_drop': return 'bg-green-100 text-green-800'
      case 'leaving_soon': return 'bg-orange-100 text-orange-800'
      case 'peak_time_reminder': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{alerts.filter(a => a.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Triggered Today</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Money Saved</p>
                <p className="text-2xl font-bold text-gray-900">£24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">3min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Alert</span>
        </Button>
        <Button variant="outline" onClick={loadAlerts} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Alerts'}
        </Button>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Create Smart Alert</span>
            </CardTitle>
            <CardDescription>
              Get notified about parking opportunities that match your preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newAlert.alert_type}
                onChange={(e) => setNewAlert({ ...newAlert, alert_type: e.target.value })}
              >
                <option value="spot_available">Spot Available</option>
                <option value="price_drop">Price Drop</option>
                <option value="leaving_soon">Someone Leaving Soon</option>
                <option value="peak_time_reminder">Peak Time Reminder</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter address or area"
                value={newAlert.location.address}
                onChange={(e) => setNewAlert({ 
                  ...newAlert, 
                  location: { ...newAlert.location, address: e.target.value }
                })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Radius: {newAlert.radius}m
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                className="w-full"
                value={newAlert.radius}
                onChange={(e) => setNewAlert({ ...newAlert, radius: parseInt(e.target.value) })}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>100m</span>
                <span>2km</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Price (£{newAlert.max_price.toFixed(2)}/hour)
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.50"
                className="w-full"
                value={newAlert.max_price}
                onChange={(e) => setNewAlert({ ...newAlert, max_price: parseFloat(e.target.value) })}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>£1</span>
                <span>£20</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Method
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newAlert.notification_method}
                onChange={(e) => setNewAlert({ ...newAlert, notification_method: e.target.value })}
              >
                <option value="push">Push Notification</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={createAlert} className="flex-1">
                Create Alert
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Your Smart Alerts</CardTitle>
          <CardDescription>
            Manage your active parking notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alerts Set</h3>
              <p className="text-gray-600">Create your first smart alert to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div key={alert.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getAlertColor(alert.alert_type)}>
                          {getAlertIcon(alert.alert_type)}
                          <span className="ml-1 capitalize">
                            {alert.alert_type.replace('_', ' ')}
                          </span>
                        </Badge>
                        {alert.is_active && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{alert.location.address}</span>
                          <span className="text-gray-400">({alert.radius}m radius)</span>
                        </div>
                        
                        {alert.max_price && (
                          <div className="flex items-center space-x-1">
                            <span>Max price: £{alert.max_price}/hour</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Triggered {alert.triggered_count || 0} times</span>
                          {alert.last_triggered && (
                            <span>Last: {new Date(alert.last_triggered).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex space-x-2">
                      <Button size="sm" variant="ghost">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => deleteAlert(alert.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Types Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Types</CardTitle>
          <CardDescription>
            Understanding different types of smart alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Spot Available</h4>
                  <p className="text-sm text-gray-600">
                    Get notified when parking spots become available in your chosen area
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Price Drop</h4>
                  <p className="text-sm text-gray-600">
                    Alert when parking prices drop below your maximum budget
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium">Leaving Soon</h4>
                  <p className="text-sm text-gray-600">
                    Know when other users are about to leave their parking spots
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Peak Time Reminder</h4>
                  <p className="text-sm text-gray-600">
                    Reminders during busy times to book in advance or use alternatives
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
