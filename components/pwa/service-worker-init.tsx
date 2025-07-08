'use client';

import { useEffect } from 'react';

const registerServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { 
        scope: '/',
        updateViaCache: 'none'
      }).then(registration => {
        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 3600000);
      }).catch(err => {
        console.error('ServiceWorker registration failed:', err);
      });
    });
  }
};

export function ServiceWorkerInit() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
