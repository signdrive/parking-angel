// Test URL normalization
import { getBaseUrl, normalizeUrl } from '@/lib/url-utils';

console.log('=== URL Normalization Test ===');

// Test cases
const testUrls = [
  'https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev:3000',
  'https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev',
  'https://localhost:3000',
  'http://localhost:3000',
];

testUrls.forEach(url => {
  console.log(`Original: ${url}`);
  console.log(`Normalized: ${normalizeUrl(url)}`);
  console.log('---');
});

console.log(`getBaseUrl(): ${getBaseUrl()}`);
console.log(`Environment NEXT_PUBLIC_SITE_URL: ${process.env.NEXT_PUBLIC_SITE_URL}`);
console.log(`Environment NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
