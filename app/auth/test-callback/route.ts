// Simple test to debug the OAuth callback issue
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('Simple callback test received request');
  
  const requestUrl = new URL(request.url);
  const searchParams = Object.fromEntries(requestUrl.searchParams.entries());
  
  console.log('Request URL:', request.url);
  console.log('Search params:', searchParams);
  
  // Simple redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}

export const dynamic = 'force-dynamic';
