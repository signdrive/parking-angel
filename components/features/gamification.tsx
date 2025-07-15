"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Star, Target, Gift, Medal, Users, Zap, Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function Gamification() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [dailyChallenges, setDailyChallenges] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    loadGamificationData()
  }, [])

  const loadGamificationData = async () => {
    setLoading(true)
    try {
      // Load user profile
      const profileResponse = await fetch('/api/gamification?user_id=current_user&action=profile')
      const profileData = await profileResponse.json()
      if (profileData.profile) {
        setUserProfile(profileData.profile)
      }

      // Load leaderboard
      const leaderboardResponse = await fetch('/api/gamification?user_id=current_user&action=leaderboard')
      const leaderboardData = await leaderboardResponse.json()
      if (leaderboardData.leaderboard) {
        setLeaderboard(leaderboardData.leaderboard)
      }

      // Load achievements
      const achievementsResponse = await fetch('/api/gamification?user_id=current_user&action=achievements')
      const achievementsData = await achievementsResponse.json()
      if (achievementsData.achievements) {
        setAchievements(achievementsData.achievements)
      }

      // Load daily challenges
      const challengesResponse = await fetch('/api/gamification?user_id=current_user&action=daily-challenges')
      const challengesData = await challengesResponse.json()
      if (challengesData.daily_challenges) {
        setDailyChallenges(challengesData.daily_challenges)
      }
    } catch (error) {
      console.error('Error loading gamification data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderProfile = () => (
    <div className="space-y-6">
      {/* Level and Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span>Your Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Level {userProfile?.level || 1}</h2>
              <p className="text-gray-600">{userProfile?.total_points || 0} total points</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-blue-600">
                {userProfile?.next_level_points - userProfile?.total_points || 0} points to next level
              </div>
              <div className="text-sm text-gray-500">Level {(userProfile?.level || 1) + 1}</div>
            </div>
          </div>
          
          <Progress 
            value={userProfile?.level_info?.progress_percentage || 0} 
            className="w-full h-3 mb-4" 
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{userProfile?.total_bookings || 0}</div>
              <div className="text-sm text-gray-600">Bookings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{userProfile?.current_streak || 0}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">£{userProfile?.money_saved || 0}</div>
              <div className="text-sm text-gray-600">Money Saved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{userProfile?.achievements_unlocked || 0}</div>
              <div className="text-sm text-gray-600">Achievements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Your Parking Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Favorite Time:</span>
                <span className="font-semibold">{userProfile?.stats?.favorite_time || '9:00 AM'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Favorite Area:</span>
                <span className="font-semibold">{userProfile?.stats?.favorite_area || 'Central London'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Session:</span>
                <span className="font-semibold">{userProfile?.stats?.average_session || '2.5 hours'}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">This Month:</span>
                <span className="font-semibold">{userProfile?.stats?.bookings_this_month || 8} bookings</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Punctuality Score:</span>
                <span className="font-semibold">{userProfile?.stats?.punctuality_score || 94}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CO₂ Saved:</span>
                <span className="font-semibold">{userProfile?.co2_saved_kg || 12.3}kg</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Rewards */}
      {userProfile?.available_rewards && userProfile.available_rewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="w-5 h-5 text-green-500" />
              <span>Available Rewards</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userProfile.available_rewards.map((reward: any, index: number) => (
                <div key={reward.id || index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-green-800">
                      {reward.type === 'discount' ? `${reward.value}% Discount` : `${reward.value} Free Hours`}
                    </div>
                    <div className="text-sm text-green-600">
                      Expires: {new Date(reward.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Claim
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderLeaderboard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span>Leaderboard</span>
        </CardTitle>
        <CardDescription>
          See how you rank against other parking champions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((user, index) => (
            <div 
              key={user.user_id} 
              className={`flex items-center justify-between p-3 rounded-lg ${
                user.user_id === 'current_user' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-500 text-white' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-gray-600">Level {user.level} • {user.achievements} achievements</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{user.points.toLocaleString()}</div>
                <div className="text-sm text-gray-600">points</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderAchievements = () => (
    <div className="space-y-4">
      {['parking', 'community', 'eco', 'exploration'].map(category => {
        const categoryAchievements = achievements.filter(a => 
          (category === 'parking' && (a.id.includes('park') || a.id.includes('spot'))) ||
          (category === 'community' && (a.id.includes('reporter') || a.id.includes('helper'))) ||
          (category === 'eco' && a.id.includes('eco')) ||
          (category === 'exploration' && (a.id.includes('explorer') || a.id.includes('area')))
        )
        
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize">{category} Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAchievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-4 rounded-lg border-2 ${
                      achievement.unlocked 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{achievement.icon}</span>
                      {achievement.unlocked && (
                        <Badge className="bg-green-100 text-green-800">Unlocked</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{achievement.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    
                    {!achievement.unlocked && achievement.progress_required && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.progress_required}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.progress_required) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-2">
                      +{achievement.points} points
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  const renderChallenges = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-500" />
          <span>Daily Challenges</span>
        </CardTitle>
        <CardDescription>
          Complete today's challenges to earn bonus points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dailyChallenges.map((challenge, index) => (
            <div key={challenge.id || index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{challenge.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">+{challenge.points}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{challenge.progress}/{challenge.target}</span>
                </div>
                <Progress 
                  value={(challenge.progress / challenge.target) * 100} 
                  className="h-2"
                />
              </div>
              
              {challenge.completed && (
                <Badge className="mt-2 bg-green-100 text-green-800">Completed</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading your rewards...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {[
          { id: 'profile', label: 'Profile', icon: Crown },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          { id: 'achievements', label: 'Achievements', icon: Medal },
          { id: 'challenges', label: 'Daily Challenges', icon: Target }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'leaderboard' && renderLeaderboard()}
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'challenges' && renderChallenges()}
      </div>
    </div>
  )
}
