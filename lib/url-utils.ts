/**
 * Utility functions for handling URLs in different environments
 */

export function normalizeUrl(url: string): string {
  // Handle Codespace URLs - they already have the port in the subdomain
  if (url.includes('.app.github.dev')) {
    // Remove any :3000 or :443 port that might be added
    return url.replace(/:(3000|443)$/, '');
  }
  
  // Handle localhost URLs - keep the port for localhost
  if (url.includes('localhost')) {
    return url;
  }
  
  return url;
}

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return normalizeUrl(window.location.origin);
  }
  
  // Server-side - use environment variables
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (siteUrl) {
    return normalizeUrl(siteUrl);
  }
  
  return 'http://localhost:3000';
}

export function buildRedirectUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

export function isCodespaceEnvironment(): boolean {
  if (typeof window !== 'undefined') {
    return window.location.host.includes('.app.github.dev');
  }
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || '';
  return siteUrl.includes('.app.github.dev');
}

export function getRedirectUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${baseUrl}${cleanPath}`;
  
  // Extra safeguard: ensure no duplicate ports in final URL
  return fullUrl.replace(/\.app\.github\.dev:\d+/, '.app.github.dev');
}
