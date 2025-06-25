import { getBrowserClient } from './supabase/browser'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types/supabase'

export interface PremiumPlan {
  id: string
  name: string
  price: number
  interval: "monthly" | "yearly"
  features: string[]
  limits: {
    maxSavedSpots: number
    maxAlerts: number
    advancedPredictions: boolean
    prioritySupport: boolean
    apiAccess: boolean
    dailySearches: number // -1 for unlimited
    spotHolds: boolean
    evCharging: boolean
    fleetManagement: boolean
  }
}

export interface UserSubscription {
  userId: string
  planId: string
  status: "active" | "canceled" | "expired" | "trial"
  currentPeriodStart: Date
  currentPeriodEnd: Date
  trialEnd?: Date
  cancelAtPeriodEnd: boolean
}

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    interval: "monthly",
    features: [
      "5 searches per day",
      "Basic parking map", 
      "Community reports",
      "Ad-supported experience",
      "Email support"
    ],
    limits: {
      maxSavedSpots: 3,
      maxAlerts: 2,
      advancedPredictions: false,
      prioritySupport: false,
      apiAccess: false,
      dailySearches: 5,
      spotHolds: false,
      evCharging: false,
      fleetManagement: false,
    },
  },
  {
    id: "navigator",
    name: "Navigator", 
    price: 8.99,
    interval: "monthly",
    features: [
      "Unlimited searches",
      "Ad-free experience",
      "Route planning integration",
      "Real-time spot updates",
      "10 saved favorites",
      "Basic analytics",
      "Spot hold service",
      "EV charging integration",
      "Email + chat support"
    ],
    limits: {
      maxSavedSpots: 10,
      maxAlerts: 10,
      advancedPredictions: false,
      prioritySupport: false,
      apiAccess: false,
      dailySearches: -1,
      spotHolds: true,
      evCharging: true,
      fleetManagement: false,
    },
  },
  {
    id: "pro_parker",
    name: "Pro Parker",
    price: 19.99,
    interval: "monthly", 
    features: [
      "Everything in Navigator",
      "AI-powered predictions",
      "Unlimited saved spots",
      "Smart notifications",
      "Price drop alerts",
      "Weather-smart recommendations", 
      "Advanced analytics dashboard",
      "Priority support",
      "Early access to features"
    ],
    limits: {
      maxSavedSpots: -1,
      maxAlerts: 25,
      advancedPredictions: true,
      prioritySupport: true,
      apiAccess: false,
      dailySearches: -1,
      spotHolds: true,
      evCharging: true,
      fleetManagement: false,
    },
  },
  {
    id: "fleet_manager",
    name: "Fleet Manager",
    price: 49.99,
    interval: "monthly",
    features: [
      "Everything in Pro Parker",
      "Multi-vehicle management",
      "Team dashboard",
      "API access & integrations",
      "Bulk booking discounts",
      "Custom reporting",
      "Dedicated account manager",
      "SLA guarantees",
      "White-label options"
    ],
    limits: {
      maxSavedSpots: -1,
      maxAlerts: -1,
      advancedPredictions: true,
      prioritySupport: true,
      apiAccess: true,
      dailySearches: -1,
      spotHolds: true,
      evCharging: true,
      fleetManagement: true,
    },
  },
]

export class PremiumFeatureService {
  private static instance: PremiumFeatureService
  private supabase: SupabaseClient<Database>
  private initialized: boolean = false

  private constructor() {
    this.supabase = getBrowserClient()
    this.initialized = true
  }

  static getInstance(): PremiumFeatureService {
    if (!PremiumFeatureService.instance) {
      PremiumFeatureService.instance = new PremiumFeatureService()
    }
    return PremiumFeatureService.instance
  }

  private checkInitialized() {
    if (!this.initialized || !this.supabase) {
      throw new Error('PremiumFeatureService not properly initialized')
    }
  }
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    this.checkInitialized()
    const { data } = await this.supabase.from("user_subscriptions").select("*").eq("user_id", userId).single()

    if (!data) return null

    // Map the database fields to our interface
    return {
      userId: data.user_id ?? "",
      planId: data.plan_id,
      status: data.status as "active" | "canceled" | "expired" | "trial",
      currentPeriodStart: new Date(data.created_at || new Date()),  // Using created_at as start date
      currentPeriodEnd: new Date(data.updated_at || new Date()),   // Using updated_at as end date
      trialEnd: data.trial_end ? new Date(data.trial_end) : undefined,
      cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
    }
  }

  async getUserPlan(userId: string): Promise<PremiumPlan> {
    const subscription = await this.getUserSubscription(userId)

    if (!subscription || subscription.status !== "active") {
      return PREMIUM_PLANS.find((p) => p.id === "free")!
    }

    return PREMIUM_PLANS.find((p) => p.id === subscription.planId) || PREMIUM_PLANS.find((p) => p.id === "free")!
  }

  async canUseFeature(userId: string, feature: keyof PremiumPlan["limits"]): Promise<boolean> {
    const plan = await this.getUserPlan(userId)
    return plan.limits[feature] === true || plan.limits[feature] === -1
  }

  async checkUsageLimit(userId: string, feature: keyof PremiumPlan["limits"], currentUsage: number): Promise<boolean> {
    const plan = await this.getUserPlan(userId)
    const limit = plan.limits[feature]

    if (limit === -1) return true // Unlimited
    if (typeof limit === "boolean") return limit
    if (typeof limit === "number") return currentUsage < limit

    return false
  }

  async startFreeTrial(userId: string, planId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user already had a trial
      const { data: existingTrial } = await this.supabase
        .from("user_subscriptions")
        .select("trial_end")
        .eq("user_id", userId)
        .not("trial_end", "is", null)
        .single()

      if (existingTrial) {
        return { success: false, error: "Free trial already used" }
      }

      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 14) // 14-day trial

      await this.supabase.from("user_subscriptions").upsert({
        user_id: userId,
        plan_id: planId,
        status: "trial",
        current_period_start: new Date().toISOString(),
        current_period_end: trialEnd.toISOString(),
        trial_end: trialEnd.toISOString(),
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
      })

      return { success: true }
    } catch (error) {
      console.error("Error starting free trial:", error)
      return { success: false, error: "Failed to start trial" }
    }
  }

  async upgradePlan(userId: string, newPlanId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const newPlan = PREMIUM_PLANS.find((p) => p.id === newPlanId)
      if (!newPlan) {
        return { success: false, error: "Invalid plan" }
      }

      // In a real app, this would integrate with Stripe or similar
      const subscription = await this.getUserSubscription(userId)

      if (subscription) {
        // Update existing subscription
        await this.supabase
          .from("user_subscriptions")
          .update({
            plan_id: newPlanId,
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
      } else {
        // Create new subscription
        const periodEnd = new Date()
        periodEnd.setMonth(periodEnd.getMonth() + 1)

        await this.supabase.from("user_subscriptions").insert({
          user_id: userId,
          plan_id: newPlanId,
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
          created_at: new Date().toISOString(),
        })
      }

      // Log the upgrade
      await this.supabase.from("subscription_events").insert({
        user_id: userId,
        event_type: "upgrade",
        from_plan: subscription?.planId || "free",
        to_plan: newPlanId,
        created_at: new Date().toISOString(),
      })

      return { success: true }
    } catch (error) {
      console.error("Error upgrading plan:", error)
      return { success: false, error: "Failed to upgrade plan" }
    }
  }

  async cancelSubscription(userId: string, immediate = false): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = await this.getUserSubscription(userId)
      if (!subscription) {
        return { success: false, error: "No active subscription" }
      }

      if (immediate) {
        await this.supabase
          .from("user_subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
      } else {
        await this.supabase
          .from("user_subscriptions")
          .update({
            cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
      }

      return { success: true }
    } catch (error) {
      console.error("Error canceling subscription:", error)
      return { success: false, error: "Failed to cancel subscription" }
    }
  }

  async getUsageStats(userId: string): Promise<{
    savedSpots: number
    activeAlerts: number
    apiCalls: number
    planLimits: PremiumPlan["limits"]
  }> {
    const plan = await this.getUserPlan(userId)

    // Get current usage
    const [savedSpotsResult, apiCallsResult] = await Promise.all([
      this.supabase.from("user_favorite_spots").select("id", { count: "exact" }).eq("user_id", userId),
      this.supabase
        .from("api_usage")
        .select("calls", { count: "exact" })
        .eq("user_id", userId)
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()), // Last 30 days
    ])

    return {
      savedSpots: savedSpotsResult.count || 0,
      activeAlerts: 0, // user_alerts not in types
      apiCalls: apiCallsResult.count || 0,
      planLimits: plan.limits,
    }
  }
}
