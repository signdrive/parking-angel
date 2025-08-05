'use client';

import { clearCorruptedSession } from './browser';

// Global error handler for session corruption
export function handleSessionError(error: Error): boolean {
  if (error.message.includes('Failed to parse cookie string') || 
      error.message.includes('Unexpected token') ||
      error.message.includes('base64-eyJ')) {
    
    console.log('🔧 Session corruption detected, clearing corrupted data...');
    clearCorruptedSession();
    
    // Force page reload to start fresh
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
    return true; // Handled
  }
  
  return false; // Not handled
}

// Set up global error listeners
if (typeof window !== 'undefined') {
  // Listen for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason instanceof Error) {
      if (handleSessionError(event.reason)) {
        event.preventDefault(); // Prevent console spam
      }
    }
  });
  
  // Listen for regular errors
  window.addEventListener('error', (event) => {
    if (event.error instanceof Error) {
      handleSessionError(event.error);
    }
  });
}
