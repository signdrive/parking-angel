import { Metadata } from "next"

// Use Static Site Generation (SSG) as recommended by DeepSeek
export const dynamic = 'force-static'
export const revalidate = false // Fully static for better crawler compatibility

export const metadata: Metadata = {
  title: "AI Parking Optimization | Smart Algorithms | Parkalgo",
  description: "Transform parking efficiency with AI-powered algorithms. Smart parking management software that reduces congestion & maximizes revenue.",
  keywords: "AI parking optimization, smart parking algorithms, parking management software, automated parking solutions, dynamic parking pricing, cost-effective parking technology, cloud-based parking management",
  robots: "index, follow",
  metadataBase: new URL("https://parkalgo.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AI Parking Optimization Software | Smart Algorithms | Parkalgo",
    description: "Transform parking efficiency with AI-powered algorithms. Reduce congestion & maximize revenue through automated parking solutions.",
    url: "https://parkalgo.com/",
    siteName: "Parkalgo",
    images: [
      {
        url: "https://parkalgo.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Parkalgo AI Parking Optimization Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Parking Optimization Software | Smart Algorithms | Parkalgo",
    description: "Transform parking efficiency with AI-powered algorithms. Reduce congestion & maximize revenue.",
    images: ["https://parkalgo.com/og-image.jpg"],
  },
}

// Proper SSG page component that renders static HTML for crawlers
export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data as recommended by DeepSeek */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "AI Parking Optimization | Smart Algorithms | Parkalgo",
            "description": "Transform parking efficiency with AI-powered algorithms. Smart parking management software that reduces congestion & maximizes revenue.",
            "url": "https://parkalgo.com",
            "publisher": {
              "@type": "Organization",
              "name": "Parkalgo",
              "url": "https://parkalgo.com"
            }
          })
        }}
      />

      {/* Static HTML content for crawlers - following DeepSeek's SSG recommendations */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">Park Algo</span>
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                AI POWERED
              </span>
            </div>
            <div className="space-x-4">
              <a href="/auth/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                Sign In
              </a>
              <a href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </a>
            </div>
          </nav>
        </header>

        <main className="container mx-auto px-4 py-12">
          {/* SEO-Critical H1 tag - visible to crawlers */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI Parking Optimization <span className="text-blue-600">Smart Algorithms</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform parking efficiency with AI-powered algorithms. Our smart parking management software reduces congestion, maximizes revenue, and delivers automated solutions for businesses, municipalities, and smart cities worldwide.
            </p>
            <div className="space-x-4">
              <a href="/auth/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
                Start Finding Parking
              </a>
              <a href="/dashboard" className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors">
                View Live Map
              </a>
            </div>
          </div>

          {/* Key Features Section with H2 tags */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
              Intelligent Parking Management Features
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Advanced AI Technology</h3>
                <p className="text-gray-600 text-sm">
                  Our machine learning algorithms analyze real-time parking data, traffic patterns, and user behavior to deliver 94% accurate parking availability predictions and smart recommendations.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Enterprise Solutions</h3>
                <p className="text-gray-600 text-sm">
                  From small businesses to smart city implementations, our scalable parking management platform reduces operational costs by up to 40% while improving customer satisfaction.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Real-Time Integration</h3>
                <p className="text-gray-600 text-sm">
                  Seamlessly integrate with existing parking infrastructure, payment systems, and municipal databases for comprehensive parking ecosystem management and optimization.
                </p>
              </div>
            </div>
          </section>

          {/* Transform Operations Section */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
              Transform Your Parking Operations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center mb-12">
              Discover how businesses, municipalities, and individual drivers are leveraging our AI-powered platform to reduce costs, improve efficiency, and enhance the overall parking experience.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Businesses & Retail</h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Increase customer satisfaction with guaranteed parking availability</li>
                  <li>• Optimize parking space utilization and revenue generation</li>
                  <li>• Reduce operational costs with automated management systems</li>
                  <li>• Access comprehensive analytics and reporting dashboards</li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Smart Cities & Municipalities</h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Reduce urban traffic congestion through intelligent routing</li>
                  <li>• Implement dynamic pricing strategies for optimal space allocation</li>
                  <li>• Monitor environmental impact with emissions tracking</li>
                  <li>• Integrate with existing smart city infrastructure systems</li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Individual Drivers</h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Save time with AI-powered parking spot predictions</li>
                  <li>• Reduce fuel costs and environmental impact</li>
                  <li>• Access real-time parking availability and pricing information</li>
                  <li>• Enjoy gamified rewards and community engagement features</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Technology Integration Section */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
              Advanced Technology Integration
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI & Machine Learning</h3>
                <p className="text-gray-600 mb-4">
                  Our proprietary algorithms process millions of data points daily, including traffic patterns, weather conditions, local events, and historical parking trends to deliver unprecedented accuracy in parking availability predictions.
                </p>
                <p className="text-gray-600">
                  The system continuously learns from user interactions and real-world feedback, improving prediction accuracy and user experience over time through advanced neural networks and deep learning models.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-Time Data Processing</h3>
                <p className="text-gray-600 mb-4">
                  Built on modern cloud infrastructure with edge computing capabilities, our platform processes parking data in real-time, ensuring users receive the most current information for informed decision-making.
                </p>
                <p className="text-gray-600">
                  Integration with IoT sensors, mobile devices, and municipal parking systems creates a comprehensive ecosystem that delivers seamless user experiences across all touchpoints.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action Section */}
                  {/* Pricing Plans Section */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Choose Your Perfect Plan
            </h2>
            <p className="text-xl text-gray-600">
              Start free or upgrade for unlimited access to premium features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Starter Plan */}
            <div className="rounded-2xl shadow-xl bg-white p-8 flex flex-col items-center border-2 border-gray-200 transition-all duration-200">
              <div className="mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <div className="text-3xl font-extrabold mb-2">Free</div>
              <p className="text-gray-600 mb-4 text-center">
                Perfect for occasional parking with essential features.
              </p>
              <ul className="mb-6 space-y-2 text-gray-700 text-left">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>5 searches per day</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Basic parking map</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Community reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Email support</span>
                </li>
              </ul>
              <a
                href="/auth/signup"
                className="w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors text-center inline-block"
              >
                Get Started
              </a>
            </div>

            {/* Navigator Plan */}
            <div className="rounded-2xl shadow-xl bg-white p-8 flex flex-col items-center border-2 border-blue-500 scale-105 transition-all duration-200">
              <div className="mb-4">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Navigator</h3>
              <div className="text-3xl font-extrabold mb-2">
                $8.99
                <span className="text-base font-medium text-gray-500"> /mo</span>
              </div>
              <p className="text-gray-600 mb-4 text-center">
                Ideal for daily commuters with unlimited access.
              </p>
              <ul className="mb-6 space-y-2 text-gray-700 text-left">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Unlimited searches</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Ad-free experience</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Route planning</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Spot hold service</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>EV charging spots</span>
                </li>
              </ul>
              <a
                href="/plans"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors text-center inline-block"
              >
                Go Navigator
              </a>
            </div>

            {/* Pro Parker Plan */}
            <div className="rounded-2xl shadow-xl bg-white p-8 flex flex-col items-center border-2 border-gray-200 transition-all duration-200">
              <div className="mb-4">
                <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro Parker</h3>
              <div className="text-3xl font-extrabold mb-2">
                $19.99
                <span className="text-base font-medium text-gray-500"> /mo</span>
              </div>
              <p className="text-gray-600 mb-4 text-center">
                For power users who need advanced features.
              </p>
              <ul className="mb-6 space-y-2 text-gray-700 text-left">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Everything in Navigator</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Real-time analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>AI predictions</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Reserved spots</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Premium support</span>
                </li>
              </ul>
              <a
                href="/plans"
                className="w-full border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-colors text-center inline-block"
              >
                Go Pro
              </a>
            </div>

            {/* Fleet Manager Plan */}
            <div className="rounded-2xl shadow-xl bg-white p-8 flex flex-col items-center border-2 border-gray-200 transition-all duration-200">
              <div className="mb-4">
                <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Fleet Manager</h3>
              <div className="text-3xl font-extrabold mb-2">
                $49.99
                <span className="text-base font-medium text-gray-500"> /mo</span>
              </div>
              <p className="text-gray-600 mb-4 text-center">
                Designed for businesses managing vehicle fleets.
              </p>
              <ul className="mb-6 space-y-2 text-gray-700 text-left">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Everything in Pro Parker</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Fleet management</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Bulk operations</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Dedicated support</span>
                </li>
              </ul>
              <a
                href="/plans"
                className="w-full border-2 border-yellow-600 text-yellow-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-50 transition-colors text-center inline-block"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">
            Ready to Transform Your Parking Experience?
          </h2>
          <p className="text-xl mb-8 text-gray-600">
            Join thousands of drivers who've already discovered smarter parking with our AI-powered platform.
          </p>
          <div className="space-x-6">
            <a
              href="/auth/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              Start Free Trial
            </a>
            <a
              href="/auth/login"
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
            >
              Sign In
            </a>
          </div>
        </section>
        </main>

        <footer className="bg-gray-50 border-t mt-16">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-xl font-bold text-gray-900">Park Algo</span>
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  AI POWERED
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                AI-powered parking solutions that help you park smarter, faster, and stress-free.
              </p>
              <div className="flex flex-wrap items-center justify-center space-x-6 text-sm text-gray-600">
                <a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-blue-600 transition-colors">Terms</a>
                <a href="/contact" className="hover:text-blue-600 transition-colors">Contact</a>
                <a href="/faq" className="hover:text-blue-600 transition-colors">FAQ</a>
              </div>
              <p className="text-gray-600 text-sm mt-4">© 2024 Park Algo. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
// Force rebuild to clear Vercel cache - Thu Jul 31 00:40:02 UTC 2025
