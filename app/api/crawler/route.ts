import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Check if it's a crawler
  const isBot = /bot|crawler|spider|crawling|screaming frog|googlebot|bingbot|yandexbot|facebookexternalhit|twitterbot|whatsapp|linkedinbot|pinterest|slackbot|redditbot|applebot|duckduckbot|baiduspider|sogou|exalead|teoma|alexa|mj12bot|dotbot|ahrefsbot|semrushbot|majesticSEO|blekkobot|ia_archiver|wayback|archive\.org/i.test(userAgent.toLowerCase());
  
  if (!isBot) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const crawlerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>AI Parking Optimization | Smart Algorithms | Parkalgo</title>
    <meta name="description" content="Transform parking efficiency with AI-powered algorithms. Smart parking management software that reduces congestion & maximizes revenue.">
    <meta name="keywords" content="AI parking optimization, smart parking algorithms, parking management software, automated parking solutions">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://parkalgo.com">
    <meta property="og:title" content="AI Parking Optimization Software | Smart Algorithms | Parkalgo">
    <meta property="og:description" content="Transform parking efficiency with AI-powered algorithms. Reduce congestion & maximize revenue.">
    <meta property="og:url" content="https://parkalgo.com/">
    <link rel="icon" href="/favicon.ico" sizes="32x32">
</head>
<body>
    <h1>AI Parking Optimization Smart Algorithms</h1>
    <p>Transform parking efficiency with AI-powered algorithms. Our smart parking management software reduces congestion, maximizes revenue, and delivers automated solutions for businesses, municipalities, and smart cities worldwide.</p>
    
    <h2>Intelligent Parking Management Features</h2>
    <h3>Advanced AI Technology</h3>
    <p>Our machine learning algorithms analyze real-time parking data, traffic patterns, and user behavior to deliver 94% accurate parking availability predictions and smart recommendations.</p>
    
    <h3>Enterprise Solutions</h3>
    <p>From small businesses to smart city implementations, our scalable parking management platform reduces operational costs by up to 40% while improving customer satisfaction.</p>
    
    <h2>Transform Your Parking Operations</h2>
    <h3>For Businesses & Retail</h3>
    <ul>
        <li>Increase customer satisfaction with guaranteed parking availability</li>
        <li>Optimize parking space utilization and revenue generation</li>
        <li>Reduce operational costs with automated management systems</li>
    </ul>
    
    <h3>For Smart Cities & Municipalities</h3>
    <ul>
        <li>Reduce urban traffic congestion through intelligent routing</li>
        <li>Implement dynamic pricing strategies for optimal space allocation</li>
        <li>Monitor environmental impact with emissions tracking</li>
    </ul>
    
    <h2>Choose Your Perfect Plan</h2>
    <h3>Starter Plan - Free</h3>
    <p>Perfect for occasional parking with essential features including 5 searches per day, basic parking map, and community reports.</p>
    
    <h3>Navigator Plan - $8.99/mo</h3>
    <p>Ideal for daily commuters with unlimited access including unlimited searches, ad-free experience, route planning, and spot hold service.</p>
    
    <h3>Pro Parker Plan - $19.99/mo</h3>
    <p>For power users with advanced features including real-time analytics, AI predictions, reserved spots, and premium support.</p>
    
    <h3>Fleet Manager Plan - $49.99/mo</h3>
    <p>Designed for businesses managing vehicle fleets with fleet management, bulk operations, custom integrations, and dedicated support.</p>
    
    <h2>Ready to Transform Your Parking Experience?</h2>
    <p>Join thousands of drivers who've already discovered smarter parking with our AI-powered platform.</p>
    
    <p><a href="/auth/signup">Start Free Trial</a> | <a href="/auth/login">Sign In</a></p>
    <p><a href="/privacy">Privacy</a> | <a href="/terms">Terms</a> | <a href="/contact">Contact</a> | <a href="/faq">FAQ</a></p>
    <p>&copy; 2024 Park Algo. All rights reserved.</p>
</body>
</html>`;

  return new NextResponse(crawlerHtml, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-bot-detected': 'true',
      'cache-control': 'public, max-age=3600, must-revalidate',
    },
  });
}
