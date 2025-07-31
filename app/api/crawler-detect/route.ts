import { NextRequest, NextResponse } from 'next/server';

const botUserAgents = [
  'screaming frog',
  'googlebot',
  'bingbot',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegram',
  'slackbot',
  'pinterest',
  'redditbot',
  'applebot',
  'duckduckbot',
  'baiduspider',
  'ahrefsbot',
  'semrushbot',
  'majesticSEO',
  'mj12bot',
  'dotbot',
  'ia_archiver',
  'wayback',
  'archive.org',
  'spider',
  'crawler',
  'bot'
];

const seoHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>AI Parking Optimization | Smart Algorithms | Parkalgo</title>
    <meta name="description" content="Transform parking efficiency with AI-powered algorithms. Smart parking management software that reduces congestion & maximizers revenue.">
    <link rel="canonical" href="https://parkalgo.com">
</head>
<body>
    <h1>AI Parking Optimization Smart Algorithms</h1>
    <h2>Intelligent Parking Management Features</h2>
    <h2>Transform Your Parking Operations</h2>
    <h2>Advanced Technology Integration</h2>
    <h2>Choose Your Perfect Plan</h2>
    <p>Transform parking efficiency with AI-powered algorithms. Our smart parking management software reduces congestion, maximizes revenue, and delivers automated solutions for businesses, municipalities, and smart cities worldwide.</p>
</body>
</html>`;

export async function GET(request: NextRequest) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  
  // Check if it's a bot
  const isBot = botUserAgents.some(bot => userAgent.includes(bot));
  
  if (isBot) {
    return new NextResponse(seoHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
  
  // Redirect regular users to the main site
  return NextResponse.redirect(new URL('/', request.url));
}
