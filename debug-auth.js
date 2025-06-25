// Debug script to clear auth state and check PKCE flow
// Run this in browser console before testing login

console.log("=== Auth Debug Script ===");

// Clear all auth-related storage
console.log("Clearing localStorage...");
const keys = Object.keys(localStorage);
keys.forEach(key => {
  if (key.includes('supabase') || key.includes('auth') || key.includes('pkce')) {
    console.log(`Removing: ${key}`);
    localStorage.removeItem(key);
  }
});

console.log("Clearing sessionStorage...");
const sessionKeys = Object.keys(sessionStorage);
sessionKeys.forEach(key => {
  if (key.includes('supabase') || key.includes('auth') || key.includes('pkce')) {
    console.log(`Removing: ${key}`);
    sessionStorage.removeItem(key);
  }
});

console.log("Clearing cookies...");
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log("Auth state cleared. Try logging in again.");
console.log("Current localStorage keys:", Object.keys(localStorage));
console.log("Current cookies:", document.cookie);
