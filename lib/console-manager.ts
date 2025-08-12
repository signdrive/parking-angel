/**
 * Console Manager - Controls and reduces excessive console logging
 */

interface LogEntry {
  message: string;
  timestamp: number;
  count: number;
}

class ConsoleManager {
  private logHistory: Map<string, LogEntry> = new Map();
  private readonly THROTTLE_DURATION = 5000; // 5 seconds
  private readonly MAX_SAME_LOGS = 3;
  private originalConsole: typeof console;
  
  // Log levels that should be allowed in production
  private readonly PRODUCTION_LOG_LEVELS = new Set(['error', 'warn']);
  
  constructor() {
    this.originalConsole = { ...console };
    this.setupConsoleOverrides();
  }

  private setupConsoleOverrides() {
    // Only override in production or when explicitly requested
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_REDUCE_CONSOLE_SPAM === 'true') {
      console.log = this.throttledLog.bind(this, 'log');
      console.info = this.throttledLog.bind(this, 'info');
      console.debug = this.throttledLog.bind(this, 'debug');
      console.warn = this.throttledLog.bind(this, 'warn');
      console.error = this.throttledLog.bind(this, 'error');
    }
  }

  private throttledLog(level: string, ...args: any[]) {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');

    const key = `${level}:${message.substring(0, 100)}`;
    const now = Date.now();
    const existing = this.logHistory.get(key);

    // In production, only allow certain log levels
    if (process.env.NODE_ENV === 'production' && !this.PRODUCTION_LOG_LEVELS.has(level)) {
      return;
    }

    // Check if we should throttle this message
    if (existing) {
      if (now - existing.timestamp < this.THROTTLE_DURATION) {
        existing.count++;
        
        // Only show the first few instances and then a summary
        if (existing.count <= this.MAX_SAME_LOGS) {
          (this.originalConsole as any)[level](...args);
        } else if (existing.count === this.MAX_SAME_LOGS + 1) {
          (this.originalConsole as any)[level](
            `🔇 [THROTTLED] "${message.substring(0, 50)}..." (${existing.count} times in ${this.THROTTLE_DURATION/1000}s)`
          );
        }
        return;
      } else {
        // Reset the counter for this message
        existing.timestamp = now;
        existing.count = 1;
      }
    } else {
      // First time seeing this message
      this.logHistory.set(key, { message, timestamp: now, count: 1 });
    }

    // Filter out specific spammy patterns
    if (this.shouldSuppress(message)) {
      return;
    }

    (this.originalConsole as any)[level](...args);
  }

  private shouldSuppress(message: string): boolean {
    const spamPatterns = [
      'Service Worker was updated because',
      'Fetch finished loading: GET',
      'Fetch finished loading: POST', 
      'Navigation state check:',
      'Google Analytics enabled in production',
      'Blocked Mapbox telemetry fetch',
      'Map refreshed after navigation',
      'requestAnimationFrame',
      'Banner not shown: beforeinstallpromptevent',
    ];

    return spamPatterns.some(pattern => message.includes(pattern));
  }

  // Method to temporarily enable full logging for debugging
  enableDebugMode(duration = 30000) {
    const originalOverrides = {
      log: console.log,
      info: console.info,
      debug: console.debug,
      warn: console.warn,
      error: console.error
    };

    // Restore original console methods
    Object.assign(console, this.originalConsole);

    console.warn(`🐛 DEBUG MODE ENABLED for ${duration/1000} seconds`);

    // Restore throttling after duration
    setTimeout(() => {
      Object.assign(console, originalOverrides);
      console.warn('🔇 Console throttling restored');
    }, duration);
  }

  // Clean up old log entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.logHistory.entries()) {
      if (now - entry.timestamp > this.THROTTLE_DURATION * 2) {
        this.logHistory.delete(key);
      }
    }
  }
}

// Create global instance
const consoleManager = new ConsoleManager();

// Clean up periodically
if (typeof window !== 'undefined') {
  setInterval(() => consoleManager.cleanup(), 60000); // Clean every minute
  
  // Make debug mode available globally for development
  (window as any).enableConsoleDebug = (duration?: number) => 
    consoleManager.enableDebugMode(duration);
}

export { consoleManager };
