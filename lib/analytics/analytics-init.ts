'use client';

let isInitialized = false;

export function initializeAnalytics() {
  if (isInitialized) {
    return;
  }
  
  try {
    console.log('Google Analytics initialized');
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize Google Analytics:', error);
  }
}

export function initializeMarketing() {
  if (isInitialized) {
    return;
  }

  try {
    console.log('Marketing tracking initialized');
  } catch (error) {
    console.error('Failed to initialize marketing:', error);
  }
}

export function initializeFunctional() {
  if (isInitialized) {
    return;
  }

  try {
    console.log('Functional features initialized');
  } catch (error) {
    console.error('Failed to initialize functional features:', error);
  }
}
