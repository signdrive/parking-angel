'use client';

import { useEffect } from 'react';
import { fetchLogger } from '@/lib/fetch-logger';
import { navigationManager } from '@/lib/navigation-manager';
// Import console manager to activate it (it auto-initializes)
import '@/lib/console-manager';

export function ConsoleInitializer() {
  useEffect(() => {
    // Initialize logging management systems
    fetchLogger.init();
    navigationManager.start();

    // Cleanup function
    return () => {
      fetchLogger.destroy();
      navigationManager.stop();
    };
  }, []);

  // This component renders nothing - it just initializes systems
  return null;
}
