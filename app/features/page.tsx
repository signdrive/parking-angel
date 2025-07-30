import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Users, Clock, Star, AlertCircle, Zap, TrendingUp, Car, Crown, MessageSquare, Bell, CheckCircle2, CreditCard } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Features | AI-Powered Parking Solutions | Parkalgo',
  description: 'Discover intelligent parking features: real-time availability, route optimization, EV charging spots, and AI predictions.',
  keywords: 'parking features, AI parking, real-time parking, route optimization, EV charging, smart parking technology',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://parkalgo.com/features',
  },
  openGraph: {
    title: 'AI-Powered Parking Features | Parkalgo',
    description: 'Explore advanced parking management features powered by artificial intelligence',
    url: 'https://parkalgo.com/features',
    siteName: 'Parkalgo',
    type: 'website',
  },
}

const features = [
  {
    icon: MapPin,
    title: "Real-Time Parking Availability",
    description: "Get instant updates on parking space availability using our network of IoT sensors and community reports. Never drive around looking for parking again.",
    benefits: ["Live occupancy data", "Historical patterns", "Accurate predictions", "Community-driven updates"]
  },
  {
    icon: Zap,
    title: "AI Route Optimization",
    description: "Our machine learning algorithms analyze traffic patterns, parking availability, and your preferences to suggest the optimal route to your destination.",
    benefits: ["Fastest route calculations", "Traffic-aware routing", "Parking integration", "Fuel efficiency optimization"]
  },
  {
    icon: Car,
    title: "EV Charging Station Locator",
    description: "Find available electric vehicle charging stations with real-time status, pricing information, and compatibility with your vehicle type.",
    benefits: ["Real-time charger status", "Pricing transparency", "Charger compatibility", "Reservation system"]
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    description: "Advanced AI predicts parking availability based on historical data, events, weather, and traffic patterns to help you plan ahead.",
    benefits: ["Availability forecasting", "Event-based predictions", "Weather impact analysis", "Peak time insights"]
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Receive intelligent alerts about parking availability, pricing changes, time limits, and when you need to move your vehicle.",
    benefits: ["Availability alerts", "Price drop notifications", "Time limit reminders", "Custom preferences"]
  },
  {
    icon: Crown,
    title: "Spot Reservation System",
    description: "Reserve parking spots in advance through our partner network. Guarantee your space before you arrive at your destination.",
    benefits: ["Advance reservations", "Partner network access", "Guaranteed availability", "Flexible cancellation"]
  },
  {
    icon: MessageSquare,
    title: "Community Reporting",
    description: "Join our community of drivers sharing real-time parking information. Report spots, confirm availability, and help others find parking.",
    benefits: ["Real-time reports", "Community verification", "Gamification rewards", "Local insights"]
  },
  {
    icon: CheckCircle2,
    title: "Multi-Vehicle Management",
    description: "Manage parking for multiple vehicles including cars, motorcycles, and commercial vehicles. Each with specific requirements and restrictions.",
    benefits: ["Vehicle profiles", "Size-specific searches", "Commercial parking", "Fleet management"]
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI-Powered Parking Features
            </h1>
            <h2 className="text-xl text-gray-600 mb-8">
              Discover how artificial intelligence transforms your parking experience with smart predictions, real-time data, and seamless automation
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/auth/signup">Try Features Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">View Pricing Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Intelligent Parking Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience the future of parking with our comprehensive suite of AI-powered features designed to save you time, money, and reduce stress.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
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
                  <h3 className="font-semibold text-gray-900 mb-3">Key Benefits:</h3>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Seamlessly Integrated Experience
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            All features work together in harmony, creating a unified parking management ecosystem that adapts to your needs and preferences.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Discovery</h3>
              <p className="text-gray-600">AI algorithms learn your patterns and preferences to suggest optimal parking solutions.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Processing</h3>
              <p className="text-gray-600">Process thousands of data points per second for accurate, up-to-date parking information.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Continuous Learning</h3>
              <p className="text-gray-600">Machine learning models improve predictions and recommendations based on usage patterns.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/signup">Start Using Features</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/parking-management-demo">See Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Internal Navigation */}
      <section className="py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Explore More</h3>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/ai-parking-optimization" className="text-blue-600 hover:underline">AI Optimization</Link>
              <Link href="/smart-parking-solutions" className="text-blue-600 hover:underline">Smart Solutions</Link>
              <Link href="/pricing" className="text-blue-600 hover:underline">Pricing Plans</Link>
              <Link href="/blog" className="text-blue-600 hover:underline">Parking Blog</Link>
              <Link href="/dashboard" className="text-blue-600 hover:underline">User Dashboard</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
