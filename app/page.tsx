"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Users, Clock, Star, AlertCircle, CreditCard, CheckCircle2, Crown, MessageSquare, Bell, Car, Trophy, Zap, TrendingUp } from "lucide-react"
import Head from "next/head"

import { EnvironmentCheck } from "@/components/setup/environment-check"
import { ConnectionTest } from "@/components/setup/connection-test"
import { ComprehensiveTest } from "@/components/setup/comprehensive-test"
import { useGeolocation } from "@/hooks/use-geolocation"
import { SiteFooter } from "@/components/layout/site-footer"
import { useAuth } from "@/components/auth/auth-provider"
import { StructuredData } from "@/components/seo/structured-data"
import { trackPageView } from "@/components/analytics/google-analytics-provider"

const STRIPE_NAVIGATOR_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID || "price_navigator_default";
const STRIPE_PRO_PARKER_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PARKER_PRICE_ID || "price_pro_parker_default";
const STRIPE_FLEET_MANAGER_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_FLEET_MANAGER_PRICE_ID || "price_fleet_manager_default";

// Add default values to prevent blank page
if (!STRIPE_NAVIGATOR_PRICE_ID || !STRIPE_PRO_PARKER_PRICE_ID || !STRIPE_FLEET_MANAGER_PRICE_ID) {
  console.warn('Some Stripe price IDs are missing. Using default values for development.');
}

const plans = [
	{
		name: "Starter",
		price: 0,
		description: "Perfect for occasional parking with essential features.",
		features: ["5 searches per day", "Basic parking map", "Community reports", "Email support"],
		cta: "Get Started",
		highlight: false,
		id: "starter",
	},
	{
		name: "Navigator",
		price: 8.99,
		description: "Ideal for daily commuters with unlimited access.",
		features: [
			"Unlimited searches",
			"Ad-free experience", 
			"Route planning",
			"Spot hold service",
			"EV charging spots",
		],
		cta: "Go Navigator",
		highlight: true,
		id: "navigator",
	},
	{
		name: "Pro Parker",
		price: 19.99,
		description: "Advanced features for parking pros and smart city dwellers.",
		features: [
			"Everything in Navigator",
			"AI-powered predictions",
			"Smart notifications",
			"Advanced analytics",
			"Priority support",
		],
		cta: "Go Pro",
		highlight: false,
		id: "pro_parker",
	},
	{
		name: "Fleet Manager",
		price: 49.99,
		description: "Enterprise solution for businesses and fleet operators.",
		features: [
			"Everything in Pro Parker",
			"Multi-vehicle management",
			"Team dashboard",
			"API access",
			"Dedicated support",
		],
		cta: "Go Enterprise",
		highlight: false,
		id: "fleet_manager",
	},
]

export default function HomePage() {
	const [mounted, setMounted] = useState(false)
	const [showSetup, setShowSetup] = useState(false)
	const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number } | null>(null)
	const { latitude, longitude, error, loading, requestGeolocation } = useGeolocation()
	const { user } = useAuth();

	useEffect(() => {
		setMounted(true)
		// Show setup if environment variables are missing
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
		const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
		setShowSetup(!supabaseUrl || !supabaseKey)
	}, [])

	// Track homepage view
	useEffect(() => {
		if (mounted) {
			trackPageView('/', 'Parkalgo - AI Parking Optimization Software | Smart Algorithms');
		}
	}, [mounted]);

	if (!mounted) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
				<div className="text-center">
					<MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		)
	}

	if (showSetup) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
				<header className="container mx-auto px-4 py-6">
					<nav className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<MapPin className="w-8 h-8 text-blue-600" />
							<span className="text-2xl font-bold text-gray-900">Park Algo</span>
						</div>
						<Button onClick={() => setShowSetup(false)} variant="outline">
							View App
						</Button>
					</nav>
				</header>

				<main className="container mx-auto px-4 py-8">
					<div className="max-w-4xl mx-auto">
						<div className="text-center mb-8">
							<AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
							<h1 className="text-3xl font-bold text-gray-900 mb-4">
								Setup Required
							</h1>
							<p className="text-lg text-gray-600">
								Welcome to Park Algo! Let's get your app configured and ready to
								use.
							</p>
						</div>

						<div className="space-y-6">
							<EnvironmentCheck />
							<ConnectionTest />
							<ComprehensiveTest />
						</div>

						<div className="mt-8 text-center">
							<p className="text-sm text-gray-600 mb-4">
								Need help? Check out the{" "}
								<a
									href="#"
									className="text-blue-600 hover:underline"
								>
									setup documentation
								</a>
							</p>
						</div>
					</div>
				</main>
			</div>
		)
	}

	return (
		<>
			<Head>
				<link rel="canonical" href="https://parkalgo.com/" />
				<meta property="og:url" content="https://parkalgo.com/" />
				<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
			</Head>
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

			{/* Early Adopter Banner */}
			<div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 shadow-lg">
				<div className="container mx-auto px-4">
					<div className="flex items-center justify-center space-x-3">
						<AlertCircle className="w-6 h-6 flex-shrink-0" />
						<div className="text-center">
							<h2 className="text-lg font-bold">
								🎉 EARLY ADOPTER PROGRAM
							</h2>
							<p className="text-sm opacity-90">
								Join now and enjoy <span className="font-bold">FREE premium features</span>, priority support, and exclusive perks! 
								<span className="font-semibold ml-1">Limited time - secure your spot!</span>
							</p>
						</div>
						<div className="hidden sm:flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
							<Clock className="w-4 h-4" />
							<span className="text-sm font-medium">Early Access</span>
						</div>
					</div>
				</div>
			</div>

			<main className="container mx-auto px-4 py-12">
				<div className="text-center mb-8">
					<Button onClick={requestGeolocation} className="mb-2">Get My Location</Button>
					{loading && <p className="text-gray-500">Getting location...</p>}
					{latitude && longitude && (
						<p className="text-green-600">Your location: {latitude}, {longitude}</p>
					)}
					{error && <p className="text-red-600">{error}</p>}
				</div>
				<div className="text-center mb-16">
					<h1 className="text-5xl font-bold text-gray-900 mb-6">
						AI Parking Optimization{" "}
						<span className="text-blue-600">Smart Algorithms</span>
					</h1>
					<p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
						Transform parking efficiency with AI-powered algorithms. Our smart parking management software reduces congestion and maximizes revenue through automated solutions for businesses and cities.
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
				</div>

				{/* Pricing Section */}
				<section className="max-w-5xl mx-auto mb-16">
					<h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
						Choose Your Plan
					</h2>
					
					{/* Test Mode Notice for Pricing */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 mx-auto max-w-2xl">
						<div className="flex items-center justify-center space-x-2 text-blue-800">
							<CreditCard className="w-5 h-5" />
							<span className="font-semibold">Test Mode Active</span>
						</div>
						<p className="text-center text-sm text-blue-700 mt-2">
							All payment features are currently in testing phase. No actual charges will be processed during beta.
						</p>
					</div>
					
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{plans.map((plan) => (
							<div
								key={plan.id}
								className={`rounded-2xl shadow-xl bg-white p-8 flex flex-col items-center border-2 transition-all duration-200 ${
									plan.highlight ? "border-blue-500 scale-105" : "border-gray-200"
								}`}
							>								<div className="mb-4">
									{plan.id === "starter" && (
										<CheckCircle2 className="w-10 h-10 text-green-500" />
									)}
									{plan.id === "navigator" && (
										<Star className="w-10 h-10 text-blue-500" />
									)}
									{plan.id === "pro_parker" && (
										<Crown className="w-10 h-10 text-purple-500" />
									)}
									{plan.id === "fleet_manager" && (
										<Crown className="w-10 h-10 text-yellow-500" />
									)}
								</div>
								<h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
								<div className="text-3xl font-extrabold mb-2">
									{plan.price === 0
										? "Free"
										: `$${plan.price}`}
									{plan.price !== 0 && (
										<span className="text-base font-medium text-gray-500">
											{" "}
											/mo
										</span>
									)}
								</div>
								<p className="text-gray-600 mb-4 text-center">
									{plan.description}
								</p>
								<ul className="mb-6 space-y-2 text-gray-700 text-left">
									{plan.features.map((feature, i) => (
										<li key={i} className="flex items-center gap-2">
											<CheckCircle2 className="w-4 h-4 text-blue-400" />
											<span>{feature}</span>
										</li>
									))}
								</ul>
								<Button
									size="lg"
									className={`w-full ${
										plan.highlight
											? "bg-blue-600 hover:bg-blue-700 text-white"
											: ""
									}`}
									variant={plan.price === 0 ? "outline" : "default"}
									onClick={() => {
										if (plan.price === 0) {
											window.location.href = "/auth/signup";
										} else {
											const planParam = encodeURIComponent(plan.id);
											if (!user) {
                                                window.location.href = `/auth/login?return_to=/checkout-redirect?plan=${planParam}`;
                                            } else {
                                                window.location.href = `/checkout-redirect?plan=${planParam}`;
                                            }
										}
									}}
								>
									{plan.cta}
								</Button>
							</div>
						))}
					</div>
				</section>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
					<Card>
						<CardHeader className="text-center">
							<MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
							<CardTitle>AI Powered</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription className="text-center">
								Smart parking predictions using machine learning and real-time data
								analysis
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="text-center">
							<Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
							<CardTitle>Secure Authentication</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription className="text-center">
								Secure login with Supabase authentication for enhanced user
								experience and data protection
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="text-center">
							<Clock className="w-12 h-12 text-orange-600 mx-auto mb-4" />
							<CardTitle>Real-time Updates</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription className="text-center">
								Live parking availability updates across all devices with real-time
								database synchronization
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="text-center">
							<Star className="w-12 h-12 text-purple-600 mx-auto mb-4" />
							<CardTitle>Smart Analytics</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription className="text-center">
								Advanced user behavior tracking and parking pattern insights for
								better recommendations
							</CardDescription>
						</CardContent>
					</Card>
				</div>

				{/* NEW FEATURES SECTION */}
				<section className="mb-16">
					<div className="text-center mb-12">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							🚀 NEW Features Just Launched!
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Experience the most advanced parking platform with community-driven features, 
							smart alerts, and gamification that makes parking fun and rewarding.
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
						<h3 className="text-2xl font-bold mb-4">Why Users Love These Features</h3>
						<div className="grid md:grid-cols-3 gap-6">
							<div className="flex items-center space-x-3">
								<TrendingUp className="w-8 h-8 text-blue-200" />
								<div className="text-left">
									<div className="font-semibold">94% Accuracy</div>
									<div className="text-blue-200 text-sm">Community-verified data</div>
								</div>
							</div>
							<div className="flex items-center space-x-3">
								<Zap className="w-8 h-8 text-yellow-200" />
								<div className="text-left">
									<div className="font-semibold">3min Response</div>
									<div className="text-blue-200 text-sm">Average alert speed</div>
								</div>
							</div>
							<div className="flex items-center space-x-3">
								<Users className="w-8 h-8 text-green-200" />
								<div className="text-left">
									<div className="font-semibold">15+ Vehicle Types</div>
									<div className="text-blue-200 text-sm">From EVs to trucks</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<div className="bg-white rounded-2xl shadow-xl p-8 text-center">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						Ready for AI-Powered Parking?
					</h2>
					<p className="text-gray-600 mb-6">
						Experience the next generation of parking apps with intelligent
						predictions and real-time features.
					</p>
					<div className="space-x-4">
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
				</div>				
			</main>

			<SiteFooter />

			{/* Structured Data for SEO */}
			<StructuredData type="software" />
			<StructuredData type="organization" />
			<StructuredData type="website" />
			<StructuredData type="faq" />
		</div>
		</>
	)
}
