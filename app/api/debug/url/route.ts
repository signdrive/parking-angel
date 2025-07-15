import { NextResponse } from 'next/server';
import { getBaseUrl, normalizeUrl } from '@/lib/url-utils';

export async function GET() {
  const debug = {
    envSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    envAppUrl: process.env.NEXT_PUBLIC_APP_URL,
    nodeEnv: process.env.NODE_ENV,
    getBaseUrl: getBaseUrl(),
    normalizeTests: {
      'https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev:3000': normalizeUrl('https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev:3000'),
      'https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev': normalizeUrl('https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev'),
      'https://localhost:3000': normalizeUrl('https://localhost:3000')
    }
  };
  
  return NextResponse.json(debug);
}
