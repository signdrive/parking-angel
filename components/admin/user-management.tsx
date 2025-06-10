"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Filter, Download, UserPlus, Shield, Ban } from "lucide-react"

interface User {
  id: string
  email: string
  full_name?: string
  created_at: string
  last_sign_in_at?: string
  email_confirmed_at?: string
  role?: string
  status: "active" | "suspended" | "pending"
  total_reports: number
  reputation_score: number
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const userData = await response.json()
        setUsers(userData)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || user.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchUsers() // Refresh the list
      }
    } catch (error) {
      console.error("Failed to update user status:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Users className="w-8 h-8 animate-pulse text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </CardTitle>
            <CardDescription>Manage user accounts, permissions, and activity</CardDescription>
          </div>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <div className="grid grid-cols-7 gap-4 p-4 border-b bg-gray-50 font-medium text-sm">
              <div>User</div>
              <div>Email</div>
              <div>Status</div>
              <div>Joined</div>
              <div>Last Active</div>
              <div>Reputation</div>
              <div>Actions</div>
            </div>

            {filteredUsers.map((user) => (
              <div key={user.id} className="grid grid-cols-7 gap-4 p-4 border-b items-center hover:bg-gray-50">
                <div>
                  <p className="font-medium">{user.full_name || "Unknown"}</p>
                  <p className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                </div>
                <div className="text-sm">
                  {user.email}
                  {!user.email_confirmed_at && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Unconfirmed
                    </Badge>
                  )}
                </div>
                <div>
                  <Badge
                    variant={
                      user.status === "active" ? "default" : user.status === "suspended" ? "destructive" : "secondary"
                    }
                  >
                    {user.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString()}</div>
                <div className="text-sm text-gray-600">
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never"}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    <span>{user.reputation_score}</span>
                    <span className="text-gray-500">({user.total_reports} reports)</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  {user.status === "active" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                      onClick={() => updateUserStatus(user.id, "suspended")}
                    >
                      <Ban className="w-3 h-3 mr-1" />
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600"
                      onClick={() => updateUserStatus(user.id, "active")}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Activate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">No users found matching your criteria.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
