import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /bot|crawler|spider|crawling|screaming frog|googlebot|bingbot|yandexbot|facebookexternalhit|twitterbot|whatsapp|linkedinbot|pinterest|slackbot|redditbot|applebot|duckduckbot|baiduspider|sogou|exalead|teoma|alexa|mj12bot|dotbot|ahrefsbot|semrushbot|majesticSEO|blekkobot|ia_archiver|wayback|archive\.org/i.test(userAgent.toLowerCase());

  // If it's a bot, return static HTML with all the SEO content
  if (isBot) {
    const staticHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover, user-scalable=yes">
  <title>AI Parking Optimization | Smart Algorithms | Parkalgo</title>
  <meta name="description" content="Transform parking efficiency with AI-powered algorithms. Smart parking management software that reduces congestion & maximizes revenue.">
  <meta name="keywords" content="AI parking optimization, smart parking algorithms, parking management software, automated parking solutions, dynamic parking pricing, cost-effective parking technology, cloud-based parking management">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://parkalgo.com/">
  <meta property="og:title" content="AI Parking Optimization Software | Smart Algorithms | Parkalgo">
  <meta property="og:description" content="Transform parking efficiency with AI-powered algorithms. Reduce congestion & maximize revenue through automated parking solutions.">
  <meta property="og:url" content="https://parkalgo.com/">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://parkalgo.com/og-image.jpg">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 3rem; font-weight: bold; color: #1f2937; margin-bottom: 1.5rem; }
    h2 { font-size: 2rem; font-weight: bold; color: #1f2937; margin: 2rem 0 1rem 0; }
    h3 { font-size: 1.5rem; font-weight: 600; color: #1f2937; margin: 1.5rem 0 1rem 0; }
    .text-blue { color: #2563eb; }
    p { margin: 1rem 0; color: #4b5563; }
    a { color: #2563eb; text-decoration: underline; }
    ul { margin: 1rem 0; padding-left: 2rem; }
    li { margin: 0.5rem 0; }
    .grid { display: grid; gap: 2rem; margin: 2rem 0; }
    .grid-3 { grid-template-columns: repeat(3, 1fr); }
    .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <nav>
        <span style="font-size: 1.5rem; font-weight: bold;">Park Algo</span>
        <span style="background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">AI POWERED</span>
      </nav>
    </header>

    <main>
      <section>
        <h1>AI Parking Optimization <span class="text-blue">Smart Algorithms</span></h1>
        <p>Transform parking efficiency with AI-powered algorithms. Our smart parking management software reduces congestion, maximizes revenue, and delivers automated solutions for businesses, municipalities, and smart cities worldwide.</p>
        
        <div class="grid grid-3">
          <div class="card">
            <h3>Advanced AI Technology</h3>
            <p>Our machine learning algorithms analyze real-time parking data, traffic patterns, and user behavior to deliver 94% accurate parking availability predictions and smart recommendations.</p>
          </div>
          <div class="card">
            <h3>Enterprise Solutions</h3>
            <p>From small businesses to smart city implementations, our scalable parking management platform reduces operational costs by up to 40% while improving customer satisfaction.</p>
          </div>
          <div class="card">
            <h3>Real-Time Integration</h3>
            <p>Seamlessly integrate with existing parking infrastructure, payment systems, and municipal databases for comprehensive parking ecosystem management and optimization.</p>
          </div>
        </div>
      </section>

      <section>
        <h2>Transform Your Parking Operations</h2>
        <p>Discover how businesses, municipalities, and individual drivers are leveraging our AI-powered platform to reduce costs, improve efficiency, and enhance the overall parking experience.</p>
        
        <div class="grid grid-3">
          <div class="card">
            <h3>For Businesses & Retail</h3>
            <ul>
              <li>Increase customer satisfaction with guaranteed parking availability</li>
              <li>Optimize parking space utilization and revenue generation</li>
              <li>Reduce operational costs with automated management systems</li>
              <li>Access comprehensive analytics and reporting dashboards</li>
            </ul>
          </div>
          <div class="card">
            <h3>For Smart Cities & Municipalities</h3>
            <ul>
              <li>Reduce urban traffic congestion through intelligent routing</li>
              <li>Implement dynamic pricing strategies for optimal space allocation</li>
              <li>Monitor environmental impact with emissions tracking</li>
              <li>Integrate with existing smart city infrastructure systems</li>
            </ul>
          </div>
          <div class="card">
            <h3>For Individual Drivers</h3>
            <ul>
              <li>Save time with AI-powered parking spot predictions</li>
              <li>Reduce fuel costs and environmental impact</li>
              <li>Access real-time parking availability and pricing information</li>
              <li>Enjoy gamified rewards and community engagement features</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2>Advanced Technology Integration</h2>
        <div class="grid" style="grid-template-columns: repeat(2, 1fr);">
          <div>
            <h3>AI & Machine Learning</h3>
            <p>Our proprietary algorithms process millions of data points daily, including traffic patterns, weather conditions, local events, and historical parking trends to deliver unprecedented accuracy in parking availability predictions.</p>
            <p>The system continuously learns from user interactions and real-world feedback, improving prediction accuracy and user experience over time through advanced neural networks and deep learning models.</p>
          </div>
          <div>
            <h3>Real-Time Data Processing</h3>
            <p>Built on modern cloud infrastructure with edge computing capabilities, our platform processes parking data in real-time, ensuring users receive the most current information for informed decision-making.</p>
            <p>Integration with IoT sensors, mobile devices, and municipal parking systems creates a comprehensive ecosystem that delivers seamless user experiences across all touchpoints.</p>
          </div>
        </div>
      </section>

      <section>
        <h2>Featured Solutions</h2>
        <div class="grid" style="grid-template-columns: repeat(4, 1fr);">
          <div class="card">
            <h3>Community Reports</h3>
            <p>Real-time parking updates from users. Report availability, earn points, and help others find spots instantly.</p>
          </div>
          <div class="card">
            <h3>Smart Alerts</h3>
            <p>Get notified about available spots, price drops, and when someone's leaving. Never miss a parking opportunity again.</p>
          </div>
          <div class="card">
            <h3>Vehicle-Specific</h3>
            <p>Find spots that fit your car, van, truck, or EV perfectly. Supports 15+ vehicle types with charging needs.</p>
          </div>
          <div class="card">
            <h3>Rewards & Gaming</h3>
            <p>Earn points, unlock achievements, climb leaderboards. Turn parking into a fun, rewarding experience.</p>
          </div>
        </div>
      </section>

      <section>
        <h2>Start Your AI-Powered Parking Journey Today</h2>
        <p>Join thousands of users and hundreds of businesses already experiencing the future of parking management. Get instant access to intelligent parking solutions with our risk-free trial period and dedicated customer success support.</p>
        
        <div style="margin: 2rem 0;">
          <p><strong>Learn More About Our Solutions:</strong></p>
          <ul style="display: flex; flex-wrap: wrap; gap: 1rem; list-style: none; padding: 0;">
            <li><a href="/features">Platform Features</a></li>
            <li><a href="/ai-parking-optimization">AI Technology</a></li>
            <li><a href="/smart-parking-solutions">Enterprise Solutions</a></li>
            <li><a href="/parking-management-demo">Interactive Demo</a></li>
            <li><a href="/dashboard">Live Dashboard</a></li>
            <li><a href="/auth/signup">Create Account</a></li>
          </ul>
        </div>
      </section>
    </main>

    <footer style="border-top: 1px solid #e5e7eb; margin-top: 4rem; padding-top: 2rem;">
      <div style="text-align: center;">
        <p><strong>Park Algo</strong> - AI-powered parking solutions that help you park smarter, faster, and stress-free.</p>
        <p style="font-size: 0.875rem; color: #6b7280;">© 2024 Park Algo. All rights reserved. | <a href="/privacy">Privacy</a> | <a href="/terms">Terms</a> | <a href="/contact">Contact</a></p>
      </div>
    </footer>
  </div>
</body>
</html>`;

    return new NextResponse(staticHTML, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Bot-Static': 'true',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // For regular users, redirect to the React app
  return NextResponse.redirect(new URL('/', request.url));
}
