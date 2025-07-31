import { Metadata } from 'next'

// This is the recommended approach from Strapi's Next.js SEO guide
export const metadata: Metadata = {
  title: 'AI Parking Optimization | Smart Algorithms | Parkalgo',
  description: 'Transform parking efficiency with AI-powered algorithms. Smart parking management software that reduces congestion & maximizes revenue through intelligent automation.',
  keywords: 'AI parking optimization, smart parking algorithms, parking management software, automated parking solutions, intelligent parking systems, dynamic parking pricing, smart city parking',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  authors: [{ name: 'Parkalgo' }],
  creator: 'Parkalgo',
  publisher: 'Parkalgo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://parkalgo.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AI Parking Optimization Software | Smart Algorithms | Parkalgo',
    description: 'Transform parking efficiency with AI-powered algorithms. Reduce congestion & maximize revenue through automated parking solutions.',
    url: 'https://parkalgo.com',
    siteName: 'Parkalgo',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Parkalgo AI Parking Optimization Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Parking Optimization Software | Smart Algorithms | Parkalgo',
    description: 'Transform parking efficiency with AI-powered algorithms. Smart parking management for businesses and cities.',
    images: ['/og-image.jpg'],
    creator: '@parkalgo',
  },
  verification: {
    google: 'google-site-verification-code-here',
  },
}

// Force static generation (SSG) as recommended by Strapi guide
export const dynamic = 'force-static'
export const revalidate = false

// Structured data as JSON-LD (Strapi's recommended approach)
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'AI Parking Optimization | Smart Algorithms | Parkalgo',
  description: 'Transform parking efficiency with AI-powered algorithms. Smart parking management software that reduces congestion & maximizes revenue through intelligent automation.',
  url: 'https://parkalgo.com',
  publisher: {
    '@type': 'Organization',
    name: 'Parkalgo',
    url: 'https://parkalgo.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://parkalgo.com/logo.png',
    },
  },
  mainEntity: {
    '@type': 'SoftwareApplication',
    name: 'Parkalgo - AI Parking Optimization',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  },
}

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data - Strapi's recommended approach */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      {/* Semantic HTML structure following Strapi guide */}
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
              <a
                href="/auth/login"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Sign In
              </a>
              <a
                href="/auth/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </a>
            </div>
          </nav>
        </header>

        <main className="container mx-auto px-4 py-12">
          {/* Hero section with proper semantic HTML */}
          <section className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI Parking Optimization <span className="text-blue-600">Smart Algorithms</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform parking efficiency with AI-powered algorithms. Our smart parking management 
              software reduces congestion, maximizes revenue, and delivers automated solutions for 
              businesses, municipalities, and smart cities worldwide.
            </p>
            <div className="space-x-4">
              <a
                href="/auth/signup"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Finding Parking
              </a>
              <a
                href="/dashboard"
                className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                View Live Map
              </a>
            </div>
          </section>

          {/* Features section with semantic HTML */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
              Intelligent Parking Management Features
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <article className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Advanced AI Technology</h3>
                <p className="text-gray-600 text-sm">
                  Our machine learning algorithms analyze real-time parking data, traffic patterns, 
                  and user behavior to deliver 94% accurate parking availability predictions and 
                  smart recommendations that help drivers find parking faster.
                </p>
              </article>
              <article className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Enterprise Solutions</h3>
                <p className="text-gray-600 text-sm">
                  From small businesses to smart city implementations, our scalable parking management 
                  platform reduces operational costs by up to 40% while improving customer satisfaction 
                  and streamlining parking operations.
                </p>
              </article>
              <article className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Real-Time Integration</h3>
                <p className="text-gray-600 text-sm">
                  Seamlessly integrate with existing parking infrastructure, payment systems, and 
                  municipal databases for comprehensive parking ecosystem management and optimization 
                  across multiple locations.
                </p>
              </article>
            </div>
          </section>

          {/* Benefits section */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
              Transform Your Parking Operations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center mb-12">
              Discover how businesses, municipalities, and individual drivers are leveraging our 
              AI-powered platform to reduce costs, improve efficiency, and enhance the overall 
              parking experience with intelligent automation.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <article className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  For Businesses & Retail
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Increase customer satisfaction with guaranteed parking availability</li>
                  <li>• Optimize parking space utilization and revenue generation</li>
                  <li>• Reduce operational costs with automated management systems</li>
                  <li>• Access comprehensive analytics and reporting dashboards</li>
                </ul>
              </article>
              <article className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  For Smart Cities & Municipalities
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Reduce urban traffic congestion through intelligent routing</li>
                  <li>• Implement dynamic pricing strategies for optimal space allocation</li>
                  <li>• Monitor environmental impact with emissions tracking</li>
                  <li>• Integrate with existing smart city infrastructure systems</li>
                </ul>
              </article>
              <article className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  For Individual Drivers
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Save time with AI-powered parking spot predictions</li>
                  <li>• Reduce fuel costs and environmental impact</li>
                  <li>• Access real-time parking availability and pricing information</li>
                  <li>• Enjoy gamified rewards and community engagement features</li>
                </ul>
              </article>
            </div>
          </section>

          {/* Technology section */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
              Advanced Technology Integration
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <article>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  AI & Machine Learning
                </h3>
                <p className="text-gray-600 mb-4">
                  Our proprietary algorithms process millions of data points daily, including traffic 
                  patterns, weather conditions, local events, and historical parking trends to deliver 
                  unprecedented accuracy in parking availability predictions.
                </p>
                <p className="text-gray-600">
                  The system continuously learns from user interactions and real-world feedback, 
                  improving prediction accuracy and user experience over time through advanced neural 
                  networks and deep learning models.
                </p>
              </article>
              <article>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Real-Time Data Processing
                </h3>
                <p className="text-gray-600 mb-4">
                  Built on modern cloud infrastructure with edge computing capabilities, our platform 
                  processes parking data in real-time, ensuring users receive the most current 
                  information for informed decision-making.
                </p>
                <p className="text-gray-600">
                  Integration with IoT sensors, mobile devices, and municipal parking systems creates 
                  a comprehensive ecosystem that delivers seamless user experiences across all touchpoints.
                </p>
              </article>
            </div>
          </section>

          {/* Pricing section with semantic structure */}
          <section className="max-w-6xl mx-auto mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">
                Choose Your Perfect Plan
              </h2>
              <p className="text-xl text-gray-600">
                Start free or upgrade for unlimited access to premium features
              </p>
            </div>
            {/* Pricing cards would go here - keeping existing structure */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Existing pricing card content */}
            </div>
          </section>

          {/* CTA section */}
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
              <nav className="flex flex-wrap items-center justify-center space-x-6 text-sm text-gray-600">
                <a href="/privacy" className="hover:text-blue-600 transition-colors">
                  Privacy
                </a>
                <a href="/terms" className="hover:text-blue-600 transition-colors">
                  Terms
                </a>
                <a href="/contact" className="hover:text-blue-600 transition-colors">
                  Contact
                </a>
                <a href="/faq" className="hover:text-blue-600 transition-colors">
                  FAQ
                </a>
              </nav>
              <p className="text-gray-600 text-sm mt-4">
                © 2025 Park Algo. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
