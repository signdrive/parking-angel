interface CircuitBreakerState {
  failures: number
  lastFailureTime: number
  state: "CLOSED" | "OPEN" | "HALF_OPEN"
  nextAttempt: number
}

export class SupabaseCircuitBreaker {
  private static instance: SupabaseCircuitBreaker
  private state: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    state: "CLOSED",
    nextAttempt: 0,
  }

  private readonly failureThreshold = 5
  private readonly timeout = 60000 // 1 minute
  private readonly retryDelay = 30000 // 30 seconds

  static getInstance(): SupabaseCircuitBreaker {
    if (!SupabaseCircuitBreaker.instance) {
      SupabaseCircuitBreaker.instance = new SupabaseCircuitBreaker()
    }
    return SupabaseCircuitBreaker.instance
  }

  async execute<T>(operation: () => Promise<T>, fallback: () => T): Promise<T> {
    const now = Date.now()

    // Check if circuit is open
    if (this.state.state === "OPEN") {
      if (now < this.state.nextAttempt) {
        console.warn("🔴 Circuit breaker OPEN - using fallback")
        return fallback()
      } else {
        this.state.state = "HALF_OPEN"
        console.log("🟡 Circuit breaker HALF_OPEN - testing connection")
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      console.error("🔴 Circuit breaker detected failure:", error)
      return fallback()
    }
  }

  private onSuccess() {
    this.state.failures = 0
    this.state.state = "CLOSED"
    console.log("🟢 Circuit breaker CLOSED - connection restored")
  }

  private onFailure() {
    this.state.failures++
    this.state.lastFailureTime = Date.now()

    if (this.state.failures >= this.failureThreshold) {
      this.state.state = "OPEN"
      this.state.nextAttempt = Date.now() + this.retryDelay
      console.warn(`🔴 Circuit breaker OPEN - too many failures (${this.state.failures})`)
    }
  }

  getState() {
    return { ...this.state }
  }
}
