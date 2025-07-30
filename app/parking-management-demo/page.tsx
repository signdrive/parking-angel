import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, MapPin, Clock, Users, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Parking Management Demo | Interactive Preview | Parkalgo',
  description: 'Experience our AI-powered parking management platform with an interactive demo. See real-time features and smart optimization in action.',
  keywords: 'parking demo, parking management demo, AI parking preview, smart parking trial, interactive parking platform',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://parkalgo.com/parking-management-demo',
  },
  openGraph: {
    title: 'Interactive Parking Management Demo | Parkalgo',
    description: 'Experience AI-powered parking management with our interactive platform demo',
    url: 'https://parkalgo.com/parking-management-demo',
    siteName: 'Parkalgo',
    type: 'website',
  },
}

const demoFeatures = [
  {
    icon: MapPin,
    title: "Real-Time Parking Map",
    description: "Explore our interactive map showing live parking availability, pricing, and navigation routes.",
    highlights: ["Live occupancy data", "Dynamic pricing display", "Optimal route suggestions", "EV charging stations"]
  },
  {
    icon: TrendingUp,
    title: "AI Predictions Dashboard",
    description: "View predictive analytics showing parking availability forecasts and demand patterns.",
    highlights: ["24-hour predictions", "Demand heatmaps", "Peak time analysis", "Weather impact modeling"]
  },
  {
    icon: Users,
    title: "Management Portal",
    description: "Experience the administrative interface for parking operators and facility managers.",
    highlights: ["Revenue analytics", "Occupancy reports", "User management", "System configuration"]
  },
  {
    icon: Clock,
    title: "Mobile Experience",
    description: "Test the mobile app interface for finding, reserving, and paying for parking spaces.",
    highlights: ["Space reservation", "Mobile payments", "Navigation integration", "Push notifications"]
  }
]

export default function ParkingManagementDemoPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Interactive Parking Management Demo
            </h1>
            <h2 className="text-xl text-gray-600 mb-8">
              Experience the full power of AI-driven parking optimization with our comprehensive demo platform. Try all features risk-free before making a decision.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/auth/signup">
                  <Play className="w-5 h-5 mr-2" />
                  Start Interactive Demo
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/features">View All Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What You'll Experience
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our interactive demo showcases real scenarios and live data to give you an authentic experience of our parking management platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {demoFeatures.map((feature, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-gray-900 mb-3">Demo Highlights:</h3>
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight, highlightIndex) => (
                      <li key={highlightIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Scenarios */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Real-World Demo Scenarios
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience different use cases and scenarios based on actual parking situations and user needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Urban Commuter</h3>
              <p className="text-gray-600 mb-4">
                Find parking for your daily commute to downtown with real-time availability and pricing optimization.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center"><ArrowRight className="w-4 h-4 text-blue-500 mr-2" />Route planning integration</li>
                <li className="flex items-center"><ArrowRight className="w-4 h-4 text-blue-500 mr-2" />Morning rush hour pricing</li>
                <li className="flex items-center"><ArrowRight className="w-4 h-4 text-blue-500 mr-2" />Spot reservation ahead</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Shopping Center Visit</h3>
              <p className="text-gray-600 mb-4">
                Navigate a busy shopping center with family, finding suitable parking spots near entrances.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center"><ArrowRight className="w-4 h-4 text-blue-500 mr-2" />Family-friendly spaces</li>
                <li className="flex items-center"><ArrowRight className="w-4 h-4 text-blue-500 mr-2" />Proximity to entrances</li>
                <li className="flex items-center"><ArrowRight className="w-4 h-4 text-blue-500 mr-2" />Time-based pricing</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">EV Charging Stop</h3>
              <p className="text-gray-600 mb-4">
                Find available EV charging stations with real-time status and reservation capabilities.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center"><ArrowRight className="w-4 h-4 text-blue-500 mr-2" />Charger compatibility</li>
                <li className="flex items-center"><ArrowRight className="w-4 h-4 text-blue-500 mr-2" />Real-time availability</li>
                <li className="flex items-center"><ArrowRight className="w-4 h-4 text-blue-500 mr-2" />Charging cost estimates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Interface */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Try the Live Demo Interface
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Access our actual demo environment with sample data to experience the platform's capabilities firsthand.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Explore?</h3>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Click below to access our interactive demo environment. No registration required - just click and start exploring all features immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Link href="/dashboard">
                  <Play className="w-5 h-5 mr-2" />
                  Launch Interactive Demo
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="/auth/signup">Create Free Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Why Try Our Demo?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Commitment</h3>
              <p className="text-gray-600">Try all features without registration, payment information, or long-term commitments.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real Data</h3>
              <p className="text-gray-600">Experience authentic scenarios with real parking data and actual usage patterns.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
              <p className="text-gray-600">Get help from our team during the demo to understand how features apply to your needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to See Parkalgo in Action?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of users who have experienced the power of AI-driven parking management through our comprehensive demo platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard">
                <Play className="w-5 h-5 mr-2" />
                Start Demo Now
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View Pricing Plans</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Internal Navigation */}
      <section className="py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Continue Exploring</h3>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/features" className="text-blue-600 hover:underline">Platform Features</Link>
              <Link href="/ai-parking-optimization" className="text-blue-600 hover:underline">AI Technology</Link>
              <Link href="/smart-parking-solutions" className="text-blue-600 hover:underline">Smart Solutions</Link>
              <Link href="/pricing" className="text-blue-600 hover:underline">Pricing Options</Link>
              <Link href="/blog" className="text-blue-600 hover:underline">Learning Resources</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
