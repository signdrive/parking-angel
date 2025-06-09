export class DatabaseDiagnostics {
  private static instance: DatabaseDiagnostics
  private diagnosticResults: Map<string, any> = new Map()

  static getInstance(): DatabaseDiagnostics {
    if (!DatabaseDiagnostics.instance) {
      DatabaseDiagnostics.instance = new DatabaseDiagnostics()
    }
    return DatabaseDiagnostics.instance
  }

  async runComprehensiveDiagnostics(): Promise<{
    summary: string
    issues: Array<{ severity: "critical" | "warning" | "info"; issue: string; solution: string }>
    recommendations: string[]
    technicalDetails: Record<string, any>
  }> {
    console.log("🔍 Starting comprehensive database diagnostics...")

    const results = {
      summary: "",
      issues: [] as Array<{ severity: "critical" | "warning" | "info"; issue: string; solution: string }>,
      recommendations: [] as string[],
      technicalDetails: {} as Record<string, any>,
    }

    // 1. Environment Configuration Check
    const envCheck = await this.checkEnvironmentConfiguration()
    results.technicalDetails.environment = envCheck

    if (!envCheck.valid) {
      results.issues.push({
        severity: "critical",
        issue: "Invalid Supabase configuration",
        solution: "Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correctly set",
      })
    }

    // 2. Network Connectivity Test
    const networkCheck = await this.checkNetworkConnectivity()
    results.technicalDetails.network = networkCheck

    if (!networkCheck.reachable) {
      results.issues.push({
        severity: "critical",
        issue: "Cannot reach Supabase servers",
        solution: "Check internet connection and firewall settings",
      })
    }

    // 3. Authentication Test
    const authCheck = await this.checkAuthentication()
    results.technicalDetails.authentication = authCheck

    if (!authCheck.valid) {
      results.issues.push({
        severity: "critical",
        issue: "Authentication failed",
        solution: "Verify API key permissions and project access",
      })
    }

    // 4. Database Schema Validation
    const schemaCheck = await this.checkDatabaseSchema()
    results.technicalDetails.schema = schemaCheck

    if (!schemaCheck.valid) {
      results.issues.push({
        severity: "critical",
        issue: "Database schema issues detected",
        solution: "Run database migration scripts to fix schema",
      })
    }

    // 5. Row Level Security Analysis
    const rlsCheck = await this.checkRowLevelSecurity()
    results.technicalDetails.rls = rlsCheck

    if (rlsCheck.blocking) {
      results.issues.push({
        severity: "warning",
        issue: "Row Level Security may be blocking queries",
        solution: "Review and update RLS policies for public access",
      })
    }

    // 6. Rate Limiting Analysis
    const rateLimitCheck = await this.checkRateLimiting()
    results.technicalDetails.rateLimit = rateLimitCheck

    if (rateLimitCheck.exceeded) {
      results.issues.push({
        severity: "critical",
        issue: "Rate limits exceeded",
        solution: "Implement request throttling or upgrade Supabase plan",
      })
    }

    // 7. Database Performance Analysis
    const performanceCheck = await this.checkDatabasePerformance()
    results.technicalDetails.performance = performanceCheck

    if (performanceCheck.slow) {
      results.issues.push({
        severity: "warning",
        issue: "Slow database response times",
        solution: "Optimize queries and consider database indexing",
      })
    }

    // Generate summary and recommendations
    results.summary = this.generateSummary(results.issues)
    results.recommendations = this.generateRecommendations(results.issues, results.technicalDetails)

    return results
  }

  private async checkEnvironmentConfiguration(): Promise<{
    valid: boolean
    url: string | null
    keyPresent: boolean
    urlFormat: boolean
  }> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    return {
      valid: !!(url && key && url.includes("supabase.co")),
      url: url || null,
      keyPresent: !!key,
      urlFormat: !!(url && url.includes("supabase.co")),
    }
  }

  private async checkNetworkConnectivity(): Promise<{
    reachable: boolean
    responseTime: number
    error?: string
  }> {
    const startTime = Date.now()
    try {
      const response = await fetch("https://supabase.com/api/health", {
        method: "HEAD",
        signal: AbortSignal.timeout(10000),
      })

      return {
        reachable: response.ok,
        responseTime: Date.now() - startTime,
      }
    } catch (error) {
      return {
        reachable: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private async checkAuthentication(): Promise<{
    valid: boolean
    error?: string
    statusCode?: number
  }> {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!url || !key) {
        return { valid: false, error: "Missing credentials" }
      }

      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        signal: AbortSignal.timeout(10000),
      })

      return {
        valid: response.status !== 401 && response.status !== 403,
        statusCode: response.status,
        error: response.status === 401 ? "Invalid API key" : response.status === 403 ? "Access forbidden" : undefined,
      }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Authentication check failed",
      }
    }
  }

  private async checkDatabaseSchema(): Promise<{
    valid: boolean
    tablesExist: boolean
    parkingSpotsTable: boolean
    error?: string
  }> {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!url || !key) {
        return { valid: false, tablesExist: false, parkingSpotsTable: false, error: "Missing credentials" }
      }

      // Check if parking_spots table exists
      const response = await fetch(`${url}/rest/v1/parking_spots?select=id&limit=1`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        signal: AbortSignal.timeout(10000),
      })

      const parkingSpotsExists = response.status !== 404

      return {
        valid: parkingSpotsExists,
        tablesExist: parkingSpotsExists,
        parkingSpotsTable: parkingSpotsExists,
        error: response.status === 404 ? "parking_spots table not found" : undefined,
      }
    } catch (error) {
      return {
        valid: false,
        tablesExist: false,
        parkingSpotsTable: false,
        error: error instanceof Error ? error.message : "Schema check failed",
      }
    }
  }

  private async checkRowLevelSecurity(): Promise<{
    blocking: boolean
    publicAccess: boolean
    error?: string
  }> {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!url || !key) {
        return { blocking: true, publicAccess: false, error: "Missing credentials" }
      }

      const response = await fetch(`${url}/rest/v1/parking_spots?select=count&limit=1`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        signal: AbortSignal.timeout(10000),
      })

      const publicAccess = response.status === 200

      return {
        blocking: !publicAccess,
        publicAccess,
        error: !publicAccess ? `HTTP ${response.status}: ${response.statusText}` : undefined,
      }
    } catch (error) {
      return {
        blocking: true,
        publicAccess: false,
        error: error instanceof Error ? error.message : "RLS check failed",
      }
    }
  }

  private async checkRateLimiting(): Promise<{
    exceeded: boolean
    remainingRequests?: number
    resetTime?: string
  }> {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!url || !key) {
        return { exceeded: false }
      }

      const response = await fetch(`${url}/rest/v1/parking_spots?select=id&limit=1`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        signal: AbortSignal.timeout(10000),
      })

      const rateLimitRemaining = response.headers.get("x-ratelimit-remaining")
      const rateLimitReset = response.headers.get("x-ratelimit-reset")

      return {
        exceeded: response.status === 429,
        remainingRequests: rateLimitRemaining ? Number.parseInt(rateLimitRemaining) : undefined,
        resetTime: rateLimitReset || undefined,
      }
    } catch (error) {
      return {
        exceeded: false,
        error: error instanceof Error ? error.message : "Rate limit check failed",
      }
    }
  }

  private async checkDatabasePerformance(): Promise<{
    slow: boolean
    averageResponseTime: number
    samples: number[]
  }> {
    const samples: number[] = []
    const sampleCount = 3

    for (let i = 0; i < sampleCount; i++) {
      const startTime = Date.now()
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!url || !key) break

        await fetch(`${url}/rest/v1/parking_spots?select=id&limit=1`, {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
          signal: AbortSignal.timeout(5000),
        })

        samples.push(Date.now() - startTime)
      } catch (error) {
        samples.push(5000) // Timeout value
      }

      // Wait between samples
      if (i < sampleCount - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    const averageResponseTime = samples.reduce((a, b) => a + b, 0) / samples.length

    return {
      slow: averageResponseTime > 2000,
      averageResponseTime,
      samples,
    }
  }

  private generateSummary(issues: Array<{ severity: string; issue: string }>): string {
    const critical = issues.filter((i) => i.severity === "critical").length
    const warnings = issues.filter((i) => i.severity === "warning").length

    if (critical > 0) {
      return `CRITICAL: ${critical} critical issues preventing database access. Immediate action required.`
    } else if (warnings > 0) {
      return `WARNING: ${warnings} issues detected that may affect performance.`
    } else {
      return "HEALTHY: No critical issues detected. Database appears to be functioning normally."
    }
  }

  private generateRecommendations(
    issues: Array<{ severity: string; issue: string }>,
    technicalDetails: Record<string, any>,
  ): string[] {
    const recommendations: string[] = []

    // Environment recommendations
    if (!technicalDetails.environment?.valid) {
      recommendations.push("1. Verify Supabase project configuration in environment variables")
      recommendations.push("2. Check that the Supabase project is active and not paused")
    }

    // Network recommendations
    if (!technicalDetails.network?.reachable) {
      recommendations.push("3. Check internet connectivity and DNS resolution")
      recommendations.push("4. Verify firewall settings allow HTTPS traffic to supabase.co")
    }

    // Authentication recommendations
    if (!technicalDetails.authentication?.valid) {
      recommendations.push("5. Regenerate API keys in Supabase dashboard")
      recommendations.push("6. Verify project permissions and access levels")
    }

    // Schema recommendations
    if (!technicalDetails.schema?.valid) {
      recommendations.push("7. Run database setup scripts to create required tables")
      recommendations.push("8. Check database migrations are up to date")
    }

    // RLS recommendations
    if (technicalDetails.rls?.blocking) {
      recommendations.push("9. Review Row Level Security policies")
      recommendations.push("10. Consider enabling public read access for parking_spots table")
    }

    // Performance recommendations
    if (technicalDetails.performance?.slow) {
      recommendations.push("11. Add database indexes for frequently queried columns")
      recommendations.push("12. Implement query optimization and caching")
    }

    // Rate limiting recommendations
    if (technicalDetails.rateLimit?.exceeded) {
      recommendations.push("13. Implement request throttling and caching")
      recommendations.push("14. Consider upgrading Supabase plan for higher limits")
    }

    // General recommendations
    recommendations.push("15. Implement circuit breaker pattern for resilience")
    recommendations.push("16. Add comprehensive error logging and monitoring")
    recommendations.push("17. Set up health checks and alerting")

    return recommendations
  }
}
