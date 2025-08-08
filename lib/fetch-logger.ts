// Fetch Logger - Silent Mode for Development
class FetchLogger {
  private static instance: FetchLogger;
  private originalFetch: typeof fetch;
  private logCount = 0;
  private readonly MAX_LOGS = 5; // Only log first 5 requests then go silent
  private isActive = false;

  private constructor() {
    this.originalFetch = fetch;
  }

  static getInstance(): FetchLogger {
    if (!FetchLogger.instance) {
      FetchLogger.instance = new FetchLogger();
    }
    return FetchLogger.instance;
  }

  init() {
    if (this.isActive) return;

    // Check if we're in development
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         (typeof window !== 'undefined' && (
                           window.location.hostname === 'localhost' || 
                           window.location.hostname.includes('github.dev') ||
                           window.location.hostname.includes('.app')
                         ));

    if (!isDevelopment) return; // Only intercept in development

    this.isActive = true;

    // Override global fetch with silent version
    if (typeof window !== 'undefined') {
      window.fetch = async (...args) => {
        const url = typeof args[0] === 'string' ? args[0] : 
                    args[0] instanceof Request ? args[0].url : 
                    args[0] instanceof URL ? args[0].toString() : 
                    'unknown';
        
        // Only log first few requests or critical errors
        if (this.logCount < this.MAX_LOGS) {
          console.log(`Fetch ${this.logCount + 1}: ${url}`);
          this.logCount++;
        }

        try {
          const response = await this.originalFetch(...args);
          
          // Only log critical errors
          if (!response.ok && response.status >= 500) {
            console.error(`Critical fetch error: ${response.status} for ${url}`);
          }
          
          return response;
        } catch (error) {
          // Always log network errors
          console.error(`Network error for ${url}:`, error);
          throw error;
        }
      };
    }
  }

  destroy() {
    if (typeof window !== 'undefined' && this.originalFetch) {
      window.fetch = this.originalFetch;
    }
    this.isActive = false;
    this.logCount = 0;
  }
}

export const fetchLogger = FetchLogger.getInstance();
