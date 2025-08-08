// Navigation State Manager - Reduced Frequency
class NavigationManager {
  private static instance: NavigationManager;
  private checkInterval: NodeJS.Timeout | null = null;
  private isActive = false;
  private lastCheck = 0;
  private readonly CHECK_INTERVAL = 30000; // Reduced to 30 seconds from 5 seconds
  private logCount = 0;
  private readonly MAX_LOGS = 3; // Only log first 3 checks then go silent

  private constructor() {}

  static getInstance(): NavigationManager {
    if (!NavigationManager.instance) {
      NavigationManager.instance = new NavigationManager();
    }
    return NavigationManager.instance;
  }

  start() {
    // Don't start in development
    if (process.env.NODE_ENV === 'development' || 
        typeof window !== 'undefined' && (
          window.location.hostname === 'localhost' || 
          window.location.hostname.includes('github.dev') ||
          window.location.hostname.includes('.app')
        )) {
      return;
    }

    if (this.isActive) return;
    
    this.isActive = true;
    this.checkInterval = setInterval(() => {
      this.checkNavigationState();
    }, this.CHECK_INTERVAL);
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isActive = false;
  }

  private checkNavigationState() {
    const now = Date.now();
    if (now - this.lastCheck < this.CHECK_INTERVAL - 1000) return;
    
    this.lastCheck = now;
    
    // Silent logging after first few checks
    if (this.logCount < this.MAX_LOGS) {
      console.log('Navigation state check', this.logCount + 1);
      this.logCount++;
    }
    
    // Perform your navigation checks here silently
    if (typeof window !== 'undefined') {
      // Check navigation state without logging
      const currentPath = window.location.pathname;
      const isLoggedIn = localStorage.getItem('auth-token');
      
      // Only log critical navigation issues
      if (!currentPath || currentPath === '/error') {
        console.error('Critical navigation error detected');
      }
    }
  }
}

export const navigationManager = NavigationManager.getInstance();
