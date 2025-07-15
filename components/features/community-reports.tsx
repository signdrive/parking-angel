"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, MapPin, Camera, Clock, Star, TrendingUp, Users, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function CommunityReports() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [newReport, setNewReport] = useState({
    spot_id: '',
    status: 'available',
    confidence: 80,
    notes: ''
  })

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/parking/reports?lat=51.5074&lng=-0.1278&radius=1000')
      const data = await response.json()
      if (data.reports) {
        setReports(data.reports)
      }
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitReport = async () => {
    try {
      const response = await fetch('/api/parking/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newReport,
          user_id: 'current_user',
          location: { lat: 51.5074, lng: -0.1278 }
        }),
      })
      
      const data = await response.json()
      if (data.success) {
        setShowSubmitForm(false)
        setNewReport({ spot_id: '', status: 'available', confidence: 80, notes: '' })
        loadReports()
      }
    } catch (error) {
      console.error('Error submitting report:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Contributors</p>
                <p className="text-2xl font-bold text-gray-900">247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
                <p className="text-2xl font-bold text-gray-900">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button onClick={() => setShowSubmitForm(true)} className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4" />
          <span>Submit Report</span>
        </Button>
        <Button variant="outline" onClick={loadReports} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Reports'}
        </Button>
      </div>

      {/* Submit Form */}
      {showSubmitForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Submit Parking Report</span>
            </CardTitle>
            <CardDescription>
              Help the community by reporting real-time parking availability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parking Spot ID or Location
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Baker Street Car Park"
                value={newReport.spot_id}
                onChange={(e) => setNewReport({ ...newReport, spot_id: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newReport.status}
                onChange={(e) => setNewReport({ ...newReport, status: e.target.value })}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="blocked">Blocked/Restricted</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence Level: {newReport.confidence}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                className="w-full"
                value={newReport.confidence}
                onChange={(e) => setNewReport({ ...newReport, confidence: parseInt(e.target.value) })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Any additional details about the parking situation..."
                value={newReport.notes}
                onChange={(e) => setNewReport({ ...newReport, notes: e.target.value })}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={submitReport} className="flex-1">
                Submit Report (+10 points)
              </Button>
              <Button variant="outline" onClick={() => setShowSubmitForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Community Reports</CardTitle>
          <CardDescription>
            Latest parking updates from community members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Yet</h3>
              <p className="text-gray-600">Be the first to submit a parking report!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {report.spot_id || `Spot ${index + 1}`}
                        </span>
                        <Badge variant={report.status === 'available' ? 'default' : 'secondary'}>
                          {report.status}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-gray-600">
                            {report.reliability_score || 85}% reliable
                          </span>
                        </div>
                      </div>
                      
                      {report.notes && (
                        <p className="text-sm text-gray-600 mb-2">{report.notes}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{report.age_minutes || Math.floor(Math.random() * 60)} minutes ago</span>
                        </div>
                        {report.photo_url && (
                          <div className="flex items-center space-x-1">
                            <Camera className="w-3 h-3" />
                            <span>Photo attached</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {report.confidence || 80}%
                        </div>
                        <div className="text-xs text-gray-500">confidence</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>How Community Reports Work</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Report Status</h3>
              <p className="text-sm text-gray-600">
                Submit real-time parking availability when you arrive or leave
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Community Validation</h3>
              <p className="text-sm text-gray-600">
                Other users validate reports, building accuracy over time
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">3. Earn Rewards</h3>
              <p className="text-sm text-gray-600">
                Get points for accurate reports and help other drivers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
