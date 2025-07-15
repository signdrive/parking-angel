// Test the URL normalization function
console.log('Testing URL normalization...');

// Test cases for the problematic URL
const testCases = [
  'https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev:3000',
  'https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev:443',
  'https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev',
  'https://localhost:3000',
  'http://localhost:3000'
];

// Import the function (we'll test this in the browser console)
const normalizeUrl = (url) => {
  if (url.includes('.app.github.dev')) {
    return url.replace(/:(3000|443)$/, '');
  }
  if (url.includes('localhost')) {
    return url;
  }
  return url;
};

testCases.forEach(url => {
  console.log(`Original: ${url}`);
  console.log(`Normalized: ${normalizeUrl(url)}`);
  console.log('---');
});

// Test the getRedirectUrl function
const getRedirectUrl = (path) => {
  const baseUrl = 'https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${baseUrl}${cleanPath}`;
  
  // Extra safeguard: ensure no duplicate ports in final URL
  return fullUrl.replace(/\.app\.github\.dev:\d+/, '.app.github.dev');
};

console.log('Testing getRedirectUrl:');
console.log(getRedirectUrl('/auth/error?message=test'));
console.log(getRedirectUrl('/auth/error?message=No access token received'));
