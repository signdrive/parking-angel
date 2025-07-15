import { type NextRequest, NextResponse } from "next/server"

// Achievement definitions
const ACHIEVEMENTS = {
  // Parking achievements
  'first_park': {
    id: 'first_park',
    name: 'First Timer',
    description: 'Complete your first parking session',
    icon: '🅿️',
    points: 50,
    badge_color: '#4CAF50',
    rarity: 'common'
  },
  'eco_warrior': {
    id: 'eco_warrior',
    name: 'Eco Warrior',
    description: 'Use 10 EV charging spots',
    icon: '🌱',
    points: 200,
    badge_color: '#2E7D32',
    rarity: 'rare',
    progress_required: 10
  },
  'city_explorer': {
    id: 'city_explorer',
    name: 'City Explorer',
    description: 'Park in 5 different areas',
    icon: '🗺️',
    points: 150,
    badge_color: '#FF9800',
    rarity: 'uncommon',
    progress_required: 5
  },
  'night_owl': {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Park 5 times between 10PM-6AM',
    icon: '🦉',
    points: 100,
    badge_color: '#3F51B5',
    rarity: 'uncommon',
    progress_required: 5
  },
  'early_bird': {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Park before 7AM 3 times',
    icon: '🐦',
    points: 75,
    badge_color: '#FF5722',
    rarity: 'common',
    progress_required: 3
  },
  'budget_master': {
    id: 'budget_master',
    name: 'Budget Master',
    description: 'Save £50 using free parking spots',
    icon: '💰',
    points: 300,
    badge_color: '#FFC107',
    rarity: 'epic',
    progress_required: 50
  },
  'reporter': {
    id: 'reporter',
    name: 'Community Reporter',
    description: 'Submit 20 parking spot reports',
    icon: '📍',
    points: 250,
    badge_color: '#9C27B0',
    rarity: 'rare',
    progress_required: 20
  },
  'helper': {
    id: 'helper',
    name: 'Helpful Hand',
    description: 'Help 10 users by sharing your departure',
    icon: '🤝',
    points: 180,
    badge_color: '#E91E63',
    rarity: 'uncommon',
    progress_required: 10
  },
  'streak_master': {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Park successfully 7 days in a row',
    icon: '🔥',
    points: 400,
    badge_color: '#FF4444',
    rarity: 'legendary',
    progress_required: 7
  },
  'photographer': {
    id: 'photographer',
    name: 'Spot Photographer',
    description: 'Upload 25 parking spot photos',
    icon: '📸',
    points: 120,
    badge_color: '#607D8B',
    rarity: 'uncommon',
    progress_required: 25
  }
}

// Level system
const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000, 13000, 16500, 20500, 25000, 30000
]

const LEVEL_REWARDS = {
  5: { type: 'discount', value: 10, description: '10% off next booking' },
  10: { type: 'free_hours', value: 2, description: '2 hours free parking' },
  15: { type: 'priority_booking', value: true, description: 'Priority booking access' }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const action = searchParams.get('action')

    if (!user_id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    switch (action) {
      case 'profile':
        return await getUserGamificationProfile(user_id)
      case 'leaderboard':
        return await getLeaderboard()
      case 'achievements':
        return await getUserAchievements(user_id)
      case 'daily-challenges':
        return await getDailyChallenges(user_id)
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

  } catch (error) {
    console.error("Error in gamification API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, action, data } = await request.json()

    if (!user_id || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    switch (action) {
      case 'award_points':
        return await awardPoints(user_id, data)
      case 'complete_action':
        return await completeAction(user_id, data)
      case 'claim_reward':
        return await claimReward(user_id, data)
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

  } catch (error) {
    console.error("Error in gamification action:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getUserGamificationProfile(user_id: string) {
  // Mock user profile - in real app, fetch from database
  const mockProfile = {
    user_id,
    total_points: 1250,
    level: calculateLevel(1250),
    next_level_points: getNextLevelPoints(1250),
    achievements_unlocked: 6,
    total_achievements: Object.keys(ACHIEVEMENTS).length,
    current_streak: 3,
    longest_streak: 7,
    total_bookings: 15,
    money_saved: 45.50,
    co2_saved_kg: 12.3,
    stats: {
      bookings_this_month: 8,
      favorite_time: '9:00 AM',
      favorite_area: 'Central London',
      average_session: '2.5 hours',
      punctuality_score: 94 // How often they arrive on time
    },
    badges: [
      { ...ACHIEVEMENTS.first_park, unlocked_at: '2024-01-15T10:00:00Z' },
      { ...ACHIEVEMENTS.early_bird, unlocked_at: '2024-01-18T07:30:00Z' },
      { ...ACHIEVEMENTS.city_explorer, unlocked_at: '2024-01-22T14:20:00Z' }
    ],
    available_rewards: [
      { id: 'reward_1', type: 'discount', value: 15, expires_at: '2024-02-15T23:59:59Z' },
      { id: 'reward_2', type: 'free_hours', value: 1, expires_at: '2024-02-10T23:59:59Z' }
    ]
  }

  return NextResponse.json({
    profile: mockProfile,
    level_info: {
      current_level: mockProfile.level,
      current_points: mockProfile.total_points,
      points_for_next_level: mockProfile.next_level_points,
      progress_percentage: ((mockProfile.total_points - LEVEL_THRESHOLDS[mockProfile.level - 1]) / 
                           (LEVEL_THRESHOLDS[mockProfile.level] - LEVEL_THRESHOLDS[mockProfile.level - 1])) * 100
    }
  })
}

async function getLeaderboard() {
  // Mock leaderboard data
  const leaderboard = [
    { user_id: 'user_1', name: 'Alex P.', points: 3450, level: 8, achievements: 12 },
    { user_id: 'user_2', name: 'Sarah M.', points: 2890, level: 7, achievements: 10 },
    { user_id: 'user_3', name: 'James R.', points: 2650, level: 7, achievements: 9 },
    { user_id: 'user_4', name: 'Emma L.', points: 2400, level: 6, achievements: 8 },
    { user_id: 'user_5', name: 'Mike D.', points: 2150, level: 6, achievements: 7 },
    { user_id: 'current_user', name: 'You', points: 1250, level: 4, achievements: 6 }
  ]

  return NextResponse.json({
    leaderboard,
    user_rank: 6,
    total_users: 1247,
    season: {
      name: 'Winter Champions',
      ends_at: '2024-03-31T23:59:59Z',
      rewards: [
        { rank: 1, reward: '£50 parking credit' },
        { rank: 2, reward: '£30 parking credit' },
        { rank: 3, reward: '£20 parking credit' },
        { rank: '4-10', reward: '£10 parking credit' }
      ]
    }
  })
}

async function getUserAchievements(user_id: string) {
  // Mock achievement progress
  const userAchievements = Object.values(ACHIEVEMENTS).map(achievement => {
    const isUnlocked = Math.random() > 0.6
    const progressRequired = 'progress_required' in achievement ? achievement.progress_required : 1
    const progress = isUnlocked ? progressRequired : 
                    Math.floor(Math.random() * progressRequired)

    return {
      ...achievement,
      unlocked: isUnlocked,
      progress: progress,
      unlocked_at: isUnlocked ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null
    }
  })

  return NextResponse.json({
    achievements: userAchievements,
    unlocked_count: userAchievements.filter(a => a.unlocked).length,
    total_count: userAchievements.length,
    categories: {
      parking: userAchievements.filter(a => a.id.includes('park') || a.id.includes('spot')),
      community: userAchievements.filter(a => a.id.includes('reporter') || a.id.includes('helper')),
      eco: userAchievements.filter(a => a.id.includes('eco')),
      exploration: userAchievements.filter(a => a.id.includes('explorer') || a.id.includes('area'))
    }
  })
}

async function getDailyChallenges(user_id: string) {
  const today = new Date().toDateString()
  
  const challenges = [
    {
      id: 'daily_1',
      title: 'Early Start',
      description: 'Park before 8 AM today',
      icon: '🌅',
      points: 25,
      progress: 0,
      target: 1,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      completed: false
    },
    {
      id: 'daily_2',
      title: 'Photo Reporter',
      description: 'Upload a photo of your parking spot',
      icon: '📸',
      points: 15,
      progress: 0,
      target: 1,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      completed: false
    },
    {
      id: 'daily_3',
      title: 'Budget Saver',
      description: 'Use a free parking spot',
      icon: '💰',
      points: 30,
      progress: 0,
      target: 1,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      completed: false
    }
  ]

  return NextResponse.json({
    daily_challenges: challenges,
    streak_bonus: {
      current_streak: 3,
      next_bonus_at: 7,
      bonus_points: 100
    },
    refresh_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  })
}

async function awardPoints(user_id: string, data: any) {
  const { points, reason, action_type } = data

  // Mock point award
  console.log(`🎯 Awarding ${points} points to ${user_id} for: ${reason}`)

  // Check for achievement progress
  const achievements_unlocked = await checkAchievementProgress(user_id, action_type)

  return NextResponse.json({
    points_awarded: points,
    new_total: 1250 + points, // Mock calculation
    achievements_unlocked,
    level_up: false, // Check if user leveled up
    bonus_multiplier: calculateBonusMultiplier(user_id)
  })
}

async function completeAction(user_id: string, data: any) {
  const { action_type, details } = data

  const pointsAwarded = calculateActionPoints(action_type, details)
  const achievements = await checkAchievementProgress(user_id, action_type)

  return NextResponse.json({
    action_completed: action_type,
    points_awarded: pointsAwarded,
    achievements_unlocked: achievements,
    daily_progress_updated: true
  })
}

async function claimReward(user_id: string, data: any) {
  const { reward_id } = data

  // Mock reward claiming
  return NextResponse.json({
    reward_claimed: reward_id,
    success: true,
    message: "Reward has been added to your account"
  })
}

function calculateLevel(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      return i + 1
    }
  }
  return 1
}

function getNextLevelPoints(points: number): number {
  const currentLevel = calculateLevel(points)
  return LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
}

function calculateActionPoints(action_type: string, details: any): number {
  const basePoints = {
    'parking_session': 10,
    'photo_upload': 5,
    'spot_report': 15,
    'help_user': 20,
    'early_parking': 25,
    'eco_parking': 30,
    'long_session': 15,
    'accurate_report': 25
  }

  let points = basePoints[action_type as keyof typeof basePoints] || 5

  // Bonus modifiers
  if (details?.session_duration > 4) points *= 1.2 // Long sessions
  if (details?.is_eco_friendly) points *= 1.5 // EV charging
  if (details?.is_peak_time) points *= 1.3 // Peak time parking
  if (details?.accuracy_rating > 90) points *= 1.4 // Accurate reports

  return Math.round(points)
}

async function checkAchievementProgress(user_id: string, action_type: string): Promise<any[]> {
  // Mock achievement checking
  const newAchievements = []

  // Simulate achievement unlock (10% chance)
  if (Math.random() > 0.9) {
    const unlockedAchievement = Object.values(ACHIEVEMENTS)[Math.floor(Math.random() * Object.values(ACHIEVEMENTS).length)]
    newAchievements.push({
      ...unlockedAchievement,
      unlocked_at: new Date().toISOString()
    })
  }

  return newAchievements
}

function calculateBonusMultiplier(user_id: string): number {
  // Mock multiplier calculation based on user activity
  return 1.0 + (Math.random() * 0.5) // 1.0x to 1.5x multiplier
}
