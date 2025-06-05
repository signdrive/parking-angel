"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"
import { updateUserSubscription } from "@/lib/firebase-auth"
import { User, Crown, Star, TrendingUp } from "lucide-react"

export function FirebaseUserProfile() {
  const { user, userProfile } = useFirebaseAuth()

  const handleUpgrade = async () => {
    if (user) {
      try {
        await updateUserSubscription(user.uid, "premium")
        // Refresh the page or update local state
        window.location.reload()
      } catch (error) {
        console.error("Upgrade failed:", error)
      }
    }
  }

  if (!user || !userProfile) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Firebase Profile
        </CardTitle>
        <CardDescription>Your account powered by Firebase Authentication</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          {userProfile.photoURL && (
            <img src={userProfile.photoURL || "/placeholder.svg"} alt="Profile" className="w-12 h-12 rounded-full" />
          )}
          <div>
            <h3 className="font-semibold">{userProfile.displayName || userProfile.email}</h3>
            <p className="text-sm text-gray-600">{userProfile.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Star className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-sm font-medium">Reputation</p>
            <p className="text-lg font-bold text-blue-600">{userProfile.reputationScore}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-medium">Reports</p>
            <p className="text-lg font-bold text-green-600">{userProfile.totalReports}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Subscription</p>
            <Badge
              className={
                userProfile.subscriptionTier === "premium"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {userProfile.subscriptionTier === "premium" ? (
                <>
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </>
              ) : (
                "Free"
              )}
            </Badge>
          </div>
          {userProfile.subscriptionTier === "free" && (
            <Button size="sm" onClick={handleUpgrade}>
              Upgrade to Premium
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>Provider: {userProfile.provider}</p>
          <p>Member since: {new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString()}</p>
          <p>Last login: {new Date(userProfile.lastLoginAt.seconds * 1000).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
