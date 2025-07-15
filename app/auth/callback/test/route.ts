// Simple test to check if callback endpoint is working
export default async function handler() {
  return new Response('Callback endpoint is working', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}
