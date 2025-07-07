import { NextResponse } from 'next/server';

/**
 * Legacy Stripe webhook endpoint that redirects to the primary endpoint.
 * 
 * @deprecated Use /api/stripe-webhook instead.
 * This endpoint is maintained for backward compatibility and automatically
 * redirects all requests to the primary webhook endpoint with a 308 status
 * (Permanent Redirect), indicating that clients should update their webhook
 * URL configuration in the Stripe Dashboard.
 * 
 * Original: /api/stripe/webhook
 * Redirects to: /api/stripe-webhook
 * 
 * @see /docs/WEBHOOK_SETUP.md for complete documentation
 */
export async function POST(req: Request) {
  // Get original request URL and transform to primary endpoint
  const url = new URL(req.url);
  url.pathname = '/api/stripe-webhook';
  
  // Set up permanent redirect to the primary endpoint
  return NextResponse.redirect(url, {
    status: 308 // 308 Permanent Redirect - clients should update their bookmarks
  });
}
