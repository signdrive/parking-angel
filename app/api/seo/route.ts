import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    // Read the static HTML file
    const htmlPath = join(process.cwd(), 'public', 'seo.html');
    const htmlContent = await readFile(htmlPath, 'utf8');
    
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'x-served-by': 'seo-api-endpoint'
      },
    });
  } catch (error) {
    console.error('Error serving SEO HTML:', error);
    
    // Fallback HTML if file reading fails
    const fallbackHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>AI Parking Optimization | Smart Algorithms | Parkalgo</title>
    <meta name="description" content="Transform parking efficiency with AI-powered algorithms. Smart parking management software that reduces congestion & maximizes revenue.">
</head>
<body>
    <h1>AI Parking Optimization Smart Algorithms</h1>
    <h2>Transform Your Parking Operations</h2>
    <p>Our AI-powered platform reduces costs, improves efficiency, and enhances the overall parking experience.</p>
    <h2>Choose Your Perfect Plan</h2>
    <p>Start free or upgrade for unlimited access to premium features</p>
</body>
</html>`;
    
    return new NextResponse(fallbackHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'x-served-by': 'seo-api-fallback'
      },
    });
  }
}
