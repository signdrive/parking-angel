import { createClient } from "@supabase/supabase-js"

// Emergency database recovery and diagnostics
export class DatabaseRecovery {
  private static instance: DatabaseRecovery
  private supabase: any = null
  private isRecovering = false

  static getInstance(): DatabaseRecovery {
    if (!DatabaseRecovery.instance) {
      DatabaseRecovery.instance = new DatabaseRecovery()
    }
    return DatabaseRecovery.instance
  }

  async diagnoseAndRecover(): Promise<{
    success: boolean
    issues: string[]
    fixes: string[]
    status: string
  }> {
    const issues: string[] = []
    const fixes: string[] = []

    console.log("🔍 Starting database recovery diagnosis...")

    // 1. Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      issues.push("Missing NEXT_PUBLIC_SUPABASE_URL")
      fixes.push("Add NEXT_PUBLIC_SUPABASE_URL to your environment variables")
    }

    if (!supabaseKey) {
      issues.push("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY")
      fixes.push("Add NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables")
    }

    if (issues.length > 0) {
      return {
        success: false,
        issues,
        fixes,
        status: "Environment variables missing",
      }
    }

    // 2. Test basic connection
    try {
      this.supabase = createClient(supabaseUrl!, supabaseKey!)

      // Simple health check
      const { data, error } = await this.supabase.from("profiles").select("count").limit(1)

      if (error) {
        issues.push(`Database connection failed: ${error.message}`)

        if (error.message.includes("JWT")) {
          fixes.push("Your API key might be invalid - check your Supabase dashboard")
        }
        if (error.message.includes("not found")) {
          fixes.push("The 'profiles' table doesn't exist - run the setup scripts")
        }
        if (error.message.includes("permission")) {
          fixes.push("RLS policies might be blocking access - check your database policies")
        }
      } else {
        console.log("✅ Basic database connection successful")
      }
    } catch (error) {
      issues.push(`Connection error: ${error}`)
      fixes.push("Check your Supabase project status and API keys")
    }

    // 3. Check specific tables
    const requiredTables = ["profiles", "parking_spots", "real_parking_spots"]

    for (const table of requiredTables) {
      try {
        const { error } = await this.supabase.from(table).select("*").limit(1)

        if (error) {
          issues.push(`Table '${table}' has issues: ${error.message}`)
          fixes.push(`Run the database setup script for ${table}`)
        }
      } catch (error) {
        issues.push(`Cannot access table '${table}'`)
        fixes.push(`Create the ${table} table using the setup scripts`)
      }
    }

    return {
      success: issues.length === 0,
      issues,
      fixes,
      status: issues.length === 0 ? "Database healthy" : "Database needs attention",
    }
  }

  async emergencyReset(): Promise<boolean> {
    if (this.isRecovering) return false

    this.isRecovering = true
    console.log("🚨 Starting emergency database reset...")

    try {
      // Clear any cached connections
      this.supabase = null

      // Recreate connection with fresh config
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        console.error("❌ Cannot reset - missing environment variables")
        return false
      }

      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: false, // Don't persist during recovery
        },
        global: {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        },
      })

      // Test the new connection
      const { error } = await this.supabase.from("profiles").select("count").limit(1)

      if (!error) {
        console.log("✅ Emergency reset successful")
        return true
      } else {
        console.error("❌ Emergency reset failed:", error.message)
        return false
      }
    } catch (error) {
      console.error("❌ Emergency reset error:", error)
      return false
    } finally {
      this.isRecovering = false
    }
  }

  getHealthyClient() {
    return this.supabase
  }
}
