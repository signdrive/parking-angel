import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Users, Clock, Star, CheckCircle2, Crown, MessageSquare, Bell, Car, Trophy, Zap, TrendingUp } from "lucide-react"

// Static content component for SEO
export function HomepageContent() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Park Algo</span>
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                AI POWERED
              </span>
            </div>
            <div className="space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </nav>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI Parking Optimization{" "}
              <span className="text-blue-600">Smart Algorithms</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform parking efficiency with AI-powered algorithms. Our smart parking management software reduces congestion, maximizes revenue, and delivers automated solutions for businesses, municipalities, and smart cities worldwide.
            </p>
            <div className="space-x-4">
              <Link href="/auth/signup">
                <Button size="lg" className="px-8 py-3">
                  Start Finding Parking
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  View Live Map
                </Button>
              </Link>
            </div>
            
            {/* Additional descriptive content for SEO */}
            <div className="mt-12 max-w-4xl mx-auto">
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
                  <h3 className="font-semibold text-gray-900 mb-2">Real-Time Intelligence</h3>
                  <p className="text-gray-600 text-sm">
                    Connect with live parking data, community reports, and smart notifications to make informed decisions and optimize parking strategies for maximum efficiency.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Features Section with better H2 structure */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Intelligent Parking Management Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover comprehensive parking solutions powered by artificial intelligence, 
                designed to streamline operations and enhance user experience across all environments.
              </p>
            </div>
          </section>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card>
              <CardHeader className="text-center">
                <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>AI-Powered Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Advanced machine learning algorithms analyze real-time traffic patterns, historical parking data, and user behavior to deliver 94% accurate availability predictions and smart recommendations for optimal parking decisions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Enterprise-Grade Security</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Bank-level security with Supabase authentication, end-to-end encryption, and GDPR-compliant data protection. Secure user management, role-based access controls, and comprehensive audit trails for enterprise deployments.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Clock className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Real-Time Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Instant parking availability updates across all connected devices with millisecond-precision database synchronization. Live occupancy monitoring, dynamic pricing updates, and automated space optimization for maximum efficiency.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Star className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Advanced Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Comprehensive business intelligence with detailed parking pattern analysis, revenue optimization insights, user behavior tracking, and predictive modeling for strategic decision-making and operational improvements.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Section */}
          <section className="max-w-5xl mx-auto mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Flexible Pricing Plans for Every Need
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                From individual drivers to enterprise fleet management, choose the perfect plan that scales with your parking requirements. All plans include our core AI-powered parking optimization technology.
              </p>
              
              {/* Internal links for SEO */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Link href="/features" className="text-blue-600 hover:text-blue-800 underline">
                  Explore All Features
                </Link>
                <Link href="/ai-parking-optimization" className="text-blue-600 hover:text-blue-800 underline">
                  AI Technology Details
                </Link>
                <Link href="/smart-parking-solutions" className="text-blue-600 hover:text-blue-800 underline">
                  Smart City Solutions
                </Link>
                <Link href="/parking-management-demo" className="text-blue-600 hover:text-blue-800 underline">
                  Live Demo
                </Link>
              </div>
            </div>
          </section>

          {/* NEW FEATURES SECTION */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Latest Platform Innovations & Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience cutting-edge parking technology with community-driven features, 
                intelligent alerts, and gamification systems that transform parking from a chore into a seamless, rewarding experience for drivers and operators alike.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader className="text-center">
                  <div className="relative">
                    <MessageSquare className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                      NEW
                    </span>
                  </div>
                  <CardTitle className="text-green-800">Community Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-green-700">
                    Real-time parking updates from users. Report availability, earn points, 
                    and help others find spots instantly.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader className="text-center">
                  <div className="relative">
                    <Bell className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                      NEW
                    </span>
                  </div>
                  <CardTitle className="text-blue-800">Smart Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-blue-700">
                    Get notified about available spots, price drops, and when someone's 
                    leaving. Never miss a parking opportunity again.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardHeader className="text-center">
                  <div className="relative">
                    <Car className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                      NEW
                    </span>
                  </div>
                  <CardTitle className="text-purple-800">Vehicle-Specific</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-purple-700">
                    Find spots that fit your car, van, truck, or EV perfectly. 
                    Supports 15+ vehicle types with charging needs.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 border-yellow-200 bg-yellow-50">
                <CardHeader className="text-center">
                  <div className="relative">
                    <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                      NEW
                    </span>
                  </div>
                  <CardTitle className="text-yellow-800">Rewards & Gaming</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-yellow-700">
                    Earn points, unlock achievements, climb leaderboards. 
                    Turn parking into a fun, rewarding experience.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Feature Benefits */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Performance Metrics & User Success Stories</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-blue-200" />
                  <div className="text-left">
                    <div className="font-semibold">94% Accuracy Rate</div>
                    <div className="text-blue-200 text-sm">Community-verified parking data</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="w-8 h-8 text-yellow-200" />
                  <div className="text-left">
                    <div className="font-semibold">3min Average Response</div>
                    <div className="text-blue-200 text-sm">Real-time alert delivery speed</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-green-200" />
                  <div className="text-left">
                    <div className="font-semibold">15+ Vehicle Types Supported</div>
                    <div className="text-blue-200 text-sm">From electric vehicles to commercial trucks</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits and Use Cases Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Transform Your Parking Operations
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover how businesses, municipalities, and individual drivers are leveraging our AI-powered platform to reduce costs, improve efficiency, and enhance the overall parking experience.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Businesses & Retail</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Increase customer satisfaction with guaranteed parking availability</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Optimize parking space utilization and revenue generation</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Reduce operational costs with automated management systems</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Access comprehensive analytics and reporting dashboards</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Smart Cities & Municipalities</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Reduce urban traffic congestion through intelligent routing</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Implement dynamic pricing strategies for optimal space allocation</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Monitor environmental impact with emissions tracking</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Integrate with existing smart city infrastructure systems</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Individual Drivers</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Save time with AI-powered parking spot predictions</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Reduce fuel costs and environmental impact</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Access real-time parking availability and pricing information</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Enjoy gamified rewards and community engagement features</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Technology Integration Details */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Advanced Technology Integration
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">AI & Machine Learning</h4>
                  <p className="text-gray-600 mb-4">
                    Our proprietary algorithms process millions of data points daily, including traffic patterns, weather conditions, local events, and historical parking trends to deliver unprecedented accuracy in parking availability predictions.
                  </p>
                  <p className="text-gray-600">
                    The system continuously learns from user interactions and real-world feedback, improving prediction accuracy and user experience over time through advanced neural networks and deep learning models.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Real-Time Data Processing</h4>
                  <p className="text-gray-600 mb-4">
                    Built on modern cloud infrastructure with edge computing capabilities, our platform processes parking data in real-time, ensuring users receive the most current information for informed decision-making.
                  </p>
                  <p className="text-gray-600">
                    Integration with IoT sensors, mobile devices, and municipal parking systems creates a comprehensive ecosystem that delivers seamless user experiences across all touchpoints.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Start Your AI-Powered Parking Journey Today
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of users and hundreds of businesses already experiencing the future of parking management. 
              Get instant access to intelligent parking solutions with our risk-free trial period and dedicated customer success support.
            </p>
            <div className="space-x-4 mb-6">
              <Link href="/auth/signup">
                <Button size="lg" className="px-8 py-3">
                  Get Started Now
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  Sign In
                </Button>
              </Link>
            </div>
            
            {/* Additional internal navigation links */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Learn More About Our Solutions:</p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link href="/features" className="text-blue-600 hover:text-blue-800 underline">
                  Platform Features
                </Link>
                <Link href="/ai-parking-optimization" className="text-blue-600 hover:text-blue-800 underline">
                  AI Technology
                </Link>
                <Link href="/smart-parking-solutions" className="text-blue-600 hover:text-blue-800 underline">
                  Enterprise Solutions
                </Link>
                <Link href="/parking-management-demo" className="text-blue-600 hover:text-blue-800 underline">
                  Interactive Demo
                </Link>
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 underline">
                  Live Dashboard
                </Link>
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 underline">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
