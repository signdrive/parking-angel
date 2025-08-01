// Test the SEO replacement logic locally
const SEO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <title>AI Parking Optimization | Smart Algorithms | Parkalgo</title>
    <meta name="description" content="Transform parking efficiency with AI-powered algorithms. Smart parking management software that reduces congestion and maximizes revenue through intelligent automation for businesses and cities.">
    <link rel="canonical" href="https://parkalgo.com/" />
</head>
<body>
    <h1>Test</h1>
</body>
</html>`;

function testReplacement(originalPath) {
    const canonicalUrl = `https://parkalgo.com${originalPath === '/' ? '' : originalPath}`;
    
    let pageTitle = 'AI Parking Optimization | Smart Algorithms | Parkalgo';
    let pageDescription = 'Transform parking efficiency with AI-powered algorithms. Smart parking management software that reduces congestion and maximizes revenue through intelligent automation for businesses and cities.';
    
    if (originalPath === '/features') {
        pageTitle = 'AI Parking Features | Smart Algorithms & Technology | Parkalgo';
        pageDescription = 'Comprehensive features of our AI parking optimization platform. Advanced analytics, real-time monitoring, dynamic pricing, and intelligent automation capabilities.';
    }
    
    console.log(`Testing path: ${originalPath}`);
    console.log(`Canonical URL: ${canonicalUrl}`);
    console.log(`Page Title: ${pageTitle}`);
    console.log('');
    
    // Test the replacements
    const dynamicSEOHTML = SEO_HTML
        .replace('href="https://parkalgo.com/"', `href="${canonicalUrl}"`)
        .replace('<title>AI Parking Optimization | Smart Algorithms | Parkalgo</title>', `<title>${pageTitle}</title>`)
        .replace(/content="Transform parking efficiency[^"]*"/, `content="${pageDescription}"`);
    
    console.log('--- Resulting HTML ---');
    console.log(dynamicSEOHTML);
    console.log('\n===================\n');
}

// Test both paths
testReplacement('/');
testReplacement('/features');
