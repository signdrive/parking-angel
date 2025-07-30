import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, Wifi, Camera, Radio, Shield, Globe, Users, Building, CheckCircle2, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Smart Parking Solutions | IoT Technology | Parkalgo',
  description: 'Comprehensive smart parking technology including IoT sensors, mobile apps, real-time monitoring, and intelligent management systems.',
  keywords: 'smart parking solutions, IoT parking, parking sensors, mobile parking app, intelligent parking management, connected parking',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://parkalgo.com/smart-parking-solutions',
  },
  openGraph: {
    title: 'Smart Parking Solutions | IoT Technology',
    description: 'Transform parking with IoT sensors, mobile technology, and intelligent management systems',
    url: 'https://parkalgo.com/smart-parking-solutions',
    siteName: 'Parkalgo',
    type: 'website',
  },
}

const solutions = [
  {
    icon: Radio,
    title: "IoT Parking Sensors",
    description: "Advanced ultrasonic and magnetic sensors detect vehicle presence with 99.5% accuracy. Install on existing infrastructure with minimal disruption.",
    features: ["99.5% accuracy", "5-year battery life", "Weather resistant", "Easy installation"]
  },
  {
    icon: Smartphone,
    title: "Mobile App Platform",
    description: "Comprehensive mobile application for drivers to find, reserve, and pay for parking spaces. Available for iOS and Android devices.",
    features: ["Real-time search", "Advance reservations", "Mobile payments", "Navigation integration"]
  },
  {
    icon: Camera,
    title: "License Plate Recognition",
    description: "AI-powered camera systems automatically identify vehicles, enforce parking rules, and streamline entry/exit processes.",
    features: ["Automatic identification", "Rule enforcement", "Access control", "Payment processing"]
  },
  {
    icon: Wifi,
    title: "Connected Infrastructure",
    description: "Mesh network technology connects all parking components, enabling real-time communication and centralized management.",
    features: ["Mesh networking", "Real-time data", "Remote monitoring", "Scalable architecture"]
  },
  {
    icon: Shield,
    title: "Security & Analytics",
    description: "Advanced security monitoring and comprehensive analytics provide insights into usage patterns and operational efficiency.",
    features: ["24/7 monitoring", "Usage analytics", "Security alerts", "Performance metrics"]
  },
  {
    icon: Globe,
    title: "Cloud Management",
    description: "Centralized cloud platform manages all parking operations with real-time dashboards, reporting, and automated processes.",
    features: ["Cloud-based control", "Real-time dashboards", "Automated reports", "Multi-site management"]
  }
]

const useCases = [
  {
    icon: Building,
    title: "Urban Parking",
    description: "Transform city parking with smart meters, dynamic pricing, and real-time availability for municipal parking areas.",
    benefits: ["Reduced congestion", "Increased revenue", "Better compliance", "Improved user experience"]
  },
  {
    icon: Users,
    title: "Commercial Facilities",
    description: "Optimize parking for shopping centers, airports, hospitals, and corporate campuses with intelligent management systems.",
    benefits: ["Higher occupancy", "Enhanced security", "Streamlined operations", "Customer satisfaction"]
  }
]

export default function SmartParkingSolutionsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Smart Parking Solutions
            </h1>
            <h2 className="text-xl text-gray-600 mb-8">
              Complete IoT-enabled parking ecosystem combining sensors, mobile technology, AI analytics, and cloud management for intelligent parking operations
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                <Link href="/auth/signup">Get Smart Solutions</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/parking-management-demo">See Live Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Technology Stack
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our smart parking platform integrates cutting-edge hardware and software components to create a seamless, intelligent parking ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <solution.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl font-bold">{solution.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {solution.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-gray-900 mb-3">Key Features:</h3>
                  <ul className="space-y-2">
                    {solution.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Smart Solutions for Every Environment
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Tailored smart parking implementations designed for specific environments and use cases.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border border-gray-200 bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <useCase.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-bold">{useCase.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {useCase.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-gray-900 mb-3">Benefits:</h3>
                  <ul className="space-y-2">
                    {useCase.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                        <ArrowRight className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
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

      {/* Implementation Process */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Simple Implementation Process
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our streamlined deployment process ensures quick installation and minimal disruption to existing operations.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-lg font-semibold mb-2">Site Assessment</h3>
              <p className="text-gray-600">Comprehensive evaluation of your parking facility and requirements analysis.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-lg font-semibold mb-2">Custom Design</h3>
              <p className="text-gray-600">Tailored solution design optimized for your specific parking environment and needs.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-lg font-semibold mb-2">Installation</h3>
              <p className="text-gray-600">Professional installation of sensors, network infrastructure, and software systems.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
              <h3 className="text-lg font-semibold mb-2">Launch & Support</h3>
              <p className="text-gray-600">System activation, user training, and ongoing technical support and maintenance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Benefits */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">
              Why Choose Smart Parking Technology?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Experience measurable improvements in efficiency, revenue, and user satisfaction with our comprehensive smart parking solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">85%</div>
              <h3 className="text-xl font-semibold mb-2">Search Time Reduction</h3>
              <p>Drivers find parking 85% faster with real-time availability data and navigation guidance.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">40%</div>
              <h3 className="text-xl font-semibold mb-2">Revenue Increase</h3>
              <p>Optimize pricing and utilization to increase parking revenue by an average of 40%.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">99.5%</div>
              <h3 className="text-xl font-semibold mb-2">Accuracy Rate</h3>
              <p>Industry-leading sensor accuracy ensures reliable real-time parking space status.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Parking?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join leading organizations worldwide who have revolutionized their parking operations with smart technology solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/auth/signup">Start Your Smart Parking Journey</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/features">Explore All Features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Internal Navigation */}
      <section className="py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Related Technologies</h3>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/ai-parking-optimization" className="text-blue-600 hover:underline">AI Optimization</Link>
              <Link href="/features" className="text-blue-600 hover:underline">Core Features</Link>
              <Link href="/pricing" className="text-blue-600 hover:underline">Solution Pricing</Link>
              <Link href="/blog" className="text-blue-600 hover:underline">Technology Blog</Link>
              <Link href="/parking-management-demo" className="text-blue-600 hover:underline">Interactive Demo</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
