"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MapPin, Edit, Trash2, Check, Flag, Clock, Car, Filter, Eye } from "lucide-react"

interface ParkingSpot {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  spot_type: string
  price_per_hour: number
  is_available: boolean
  is_verified: boolean
  is_flagged: boolean
  created_by: string
  created_at: string
  updated_at: string
  description?: string
  restrictions?: string
  user_email?: string
}

export function ParkingSpotManagement() {
  const [spots, setSpots] = useState<ParkingSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    fetchParkingSpots()
  }, [filter])

  const fetchParkingSpots = async () => {
    try {
      const response = await fetch(`/api/admin/parking-spots?filter=${filter}&search=${searchTerm}`)
      if (response.ok) {
        const data = await response.json()
        setSpots(data.spots || [])
      }
    } catch (error) {
      console.error("Failed to fetch parking spots:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateSpotStatus = async (spotId: string, updates: Partial<ParkingSpot>) => {
    try {
      const response = await fetch(`/api/admin/parking-spots/${spotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        fetchParkingSpots()
      }
    } catch (error) {
      console.error("Failed to update spot:", error)
    }
  }

  const deleteSpot = async (spotId: string) => {
    if (!confirm("Are you sure you want to delete this parking spot?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/parking-spots/${spotId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchParkingSpots()
      }
    } catch (error) {
      console.error("Failed to delete spot:", error)
    }
  }

  const handleEditSpot = (spot: ParkingSpot) => {
    setSelectedSpot(spot)
    setEditDialogOpen(true)
  }

  const saveSpotChanges = async () => {
    if (!selectedSpot) return

    await updateSpotStatus(selectedSpot.id, selectedSpot)
    setEditDialogOpen(false)
    setSelectedSpot(null)
  }

  const filteredSpots = spots.filter((spot) => {
    const matchesSearch =
      spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spot.address.toLowerCase().includes(searchTerm.toLowerCase())

    switch (filter) {
      case "pending":
        return !spot.is_verified && matchesSearch
      case "flagged":
        return spot.is_flagged && matchesSearch
      case "verified":
        return spot.is_verified && matchesSearch
      default:
        return matchesSearch
    }
  })

  const getStatusBadge = (spot: ParkingSpot) => {
    if (spot.is_flagged) {
      return <Badge variant="destructive">Flagged</Badge>
    }
    if (!spot.is_verified) {
      return <Badge variant="secondary">Pending</Badge>
    }
    if (spot.is_available) {
      return <Badge variant="default">Available</Badge>
    }
    return <Badge variant="outline">Occupied</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 animate-pulse" />
            Loading Parking Spots...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Parking Spot Management
          </CardTitle>
          <CardDescription>Manage, verify, and moderate parking spots submitted by users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Spots</Label>
              <Input
                id="search"
                placeholder="Search by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="filter">Filter by Status</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter spots" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Spots</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchParkingSpots}>
                <Filter className="w-4 h-4 mr-2" />
                Apply Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spots Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spots</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{spots.length}</div>
            <p className="text-xs text-muted-foreground">All parking spots</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{spots.filter((s) => !s.is_verified).length}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{spots.filter((s) => s.is_flagged).length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{spots.filter((s) => s.is_available).length}</div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>
      </div>

      {/* Spots Table */}
      <Card>
        <CardHeader>
          <CardTitle>Parking Spots</CardTitle>
          <CardDescription>{filteredSpots.length} spots found</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSpots.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No parking spots found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Spot Details</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type & Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSpots.map((spot) => (
                    <TableRow key={spot.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{spot.name}</p>
                          <p className="text-sm text-gray-600">{spot.description || "No description"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{spot.address}</p>
                          <p className="text-xs text-gray-500 font-mono">
                            {spot.latitude.toFixed(6)}, {spot.longitude.toFixed(6)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline">{spot.spot_type}</Badge>
                          <p className="text-sm font-medium">${spot.price_per_hour}/hr</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(spot)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{spot.user_email || "Unknown"}</p>
                          <p className="text-xs text-gray-500">{new Date(spot.created_at).toLocaleDateString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!spot.is_verified && (
                            <Button
                              size="sm"
                              onClick={() => updateSpotStatus(spot.id, { is_verified: true })}
                              title="Verify spot"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSpotStatus(spot.id, { is_flagged: !spot.is_flagged })}
                            title={spot.is_flagged ? "Unflag spot" : "Flag spot"}
                          >
                            <Flag className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditSpot(spot)} title="Edit spot">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(`https://www.google.com/maps?q=${spot.latitude},${spot.longitude}`, "_blank")
                            }
                            title="View on map"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteSpot(spot.id)}
                            title="Delete spot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Spot Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Parking Spot</DialogTitle>
            <DialogDescription>Update the parking spot details and settings</DialogDescription>
          </DialogHeader>
          {selectedSpot && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Spot Name</Label>
                  <Input
                    id="name"
                    value={selectedSpot.name}
                    onChange={(e) => setSelectedSpot({ ...selectedSpot, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Hour ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={selectedSpot.price_per_hour}
                    onChange={(e) =>
                      setSelectedSpot({ ...selectedSpot, price_per_hour: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={selectedSpot.address}
                  onChange={(e) => setSelectedSpot({ ...selectedSpot, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="spot_type">Spot Type</Label>
                  <Select
                    value={selectedSpot.spot_type}
                    onValueChange={(value) => setSelectedSpot({ ...selectedSpot, spot_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="street">Street Parking</SelectItem>
                      <SelectItem value="garage">Garage</SelectItem>
                      <SelectItem value="lot">Parking Lot</SelectItem>
                      <SelectItem value="private">Private Driveway</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={selectedSpot.is_verified ? "default" : "outline"}
                      onClick={() => setSelectedSpot({ ...selectedSpot, is_verified: !selectedSpot.is_verified })}
                    >
                      {selectedSpot.is_verified ? "Verified" : "Unverified"}
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedSpot.is_available ? "default" : "outline"}
                      onClick={() => setSelectedSpot({ ...selectedSpot, is_available: !selectedSpot.is_available })}
                    >
                      {selectedSpot.is_available ? "Available" : "Occupied"}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={selectedSpot.description || ""}
                  onChange={(e) => setSelectedSpot({ ...selectedSpot, description: e.target.value })}
                  placeholder="Add a description for this parking spot..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="restrictions">Restrictions</Label>
                <Textarea
                  id="restrictions"
                  value={selectedSpot.restrictions || ""}
                  onChange={(e) => setSelectedSpot({ ...selectedSpot, restrictions: e.target.value })}
                  placeholder="Any parking restrictions or special notes..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSpotChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
