"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Users, Clock, Star, AlertCircle, CreditCard, CheckCircle2, Crown } from "lucide-react"

import { EnvironmentCheck } from "@/components/setup/environment-check"
import { ConnectionTest } from "@/components/setup/connection-test"
import { ComprehensiveTest } from "@/components/setup/comprehensive-test"
import { useGeolocation } from "@/hooks/use-geolocation"
import { SiteFooter } from "@/components/layout/site-footer"
import { useAuth } from "@/components/auth/auth-provider"

const STRIPE_NAVIGATOR_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID || "";
const STRIPE_PRO_PARKER_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PARKER_PRICE_ID || "";
const STRIPE_FLEET_MANAGER_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_FLEET_MANAGER_PRICE_ID || "";

if (!STRIPE_NAVIGATOR_PRICE_ID || !STRIPE_PRO_PARKER_PRICE_ID || !STRIPE_FLEET_MANAGER_PRICE_ID) {
  console.warn("Some Stripe price IDs are missing. Check your .env.local and restart the dev server.");
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

			{/* Test Mode Banner */}
			<div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 shadow-lg">
				<div className="container mx-auto px-4">
					<div className="flex items-center justify-center space-x-3">
						<AlertCircle className="w-6 h-6 flex-shrink-0" />
						<div className="text-center">
							<h2 className="text-lg font-bold">
								🚧 BETA TESTING MODE
							</h2>
							<p className="text-sm opacity-90">
								We're currently in beta testing. No real payments will be processed. 
								<span className="font-semibold ml-1">Coming Soon: Full Launch!</span>
							</p>
						</div>
						<div className="hidden sm:flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
							<Clock className="w-4 h-4" />
							<span className="text-sm font-medium">Test Phase</span>
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
						Find Parking Spots with{" "}
						<span className="text-blue-600">AI Intelligence</span>
					</h1>
					<p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
						Join thousands of drivers using our AI-powered platform with secure
						authentication, real-time analytics, and smart notifications.
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
		</div>
	)
}
