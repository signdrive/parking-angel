"use client";

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MapPin, AlertCircle, CreditCard, CheckCircle2, Star, Crown } from "lucide-react"
import { SiteFooter } from "@/components/layout/site-footer"
import { useAuth } from "@/components/auth/auth-provider"

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
		description: "For power users who need advanced features.",
		features: [
			"Everything in Navigator",
			"Real-time analytics",
			"AI predictions",
			"Reserved spots",
			"Premium support",
		],
		cta: "Go Pro",
		highlight: false,
		id: "pro_parker",
	},
	{
		name: "Fleet Manager",
		price: 49.99,
		description: "Designed for businesses managing vehicle fleets.",
		features: [
			"Everything in Pro Parker",
			"Fleet management",
			"Bulk operations",
			"Custom integrations",
			"Dedicated support",
		],
		cta: "Contact Sales",
		highlight: false,
		id: "fleet_manager",
	}
];

export default function PlansPage() {
	const { user } = useAuth()
	const router = useRouter()

	const handlePlanSelection = (plan: any) => {
		if (plan.price === 0) {
			router.push("/auth/signup");
		} else {
			const planParam = encodeURIComponent(plan.id);
			if (!user) {
				router.push(`/auth/login?return_to=/checkout-redirect?plan=${planParam}`);
			} else {
				router.push(`/checkout-redirect?plan=${planParam}`);
			}
		}
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
						<Link href="/">
							<Button variant="ghost">Home</Button>
						</Link>
						<Link href="/dashboard">
							<Button variant="ghost">Dashboard</Button>
						</Link>
						{!user ? (
							<>
								<Link href="/auth/login">
									<Button variant="ghost">Sign In</Button>
								</Link>
								<Link href="/auth/signup">
									<Button>Get Started</Button>
								</Link>
							</>
						) : (
							<Link href="/dashboard">
								<Button>Dashboard</Button>
							</Link>
						)}
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
								🎉 EARLY ADOPTER SPECIAL
							</h2>
							<p className="text-sm opacity-90">
								Start free for 3 months! Early adopters get <span className="font-bold">premium features at no cost</span> + lifetime discounts. 
								<span className="font-semibold ml-1">Join the exclusive beta community!</span>
							</p>
						</div>
					</div>
				</div>
			</div>

			<main className="container mx-auto px-4 py-12">
				{/* Hero Section */}
				<div className="text-center mb-16">
					<h1 className="text-5xl font-bold text-gray-900 mb-6">
						Simple, Transparent{" "}
						<span className="text-blue-600">Pricing</span>
					</h1>
					<p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
						Choose the perfect plan for your parking needs. All plans include our core AI-powered features with secure authentication and real-time data.
					</p>
					{!user && (
						<div className="space-x-4">
							<Link href="/auth/signup">
								<Button size="lg" className="px-8 py-3">
									Get Started Free
								</Button>
							</Link>
							<Link href="/auth/login">
								<Button size="lg" variant="outline" className="px-8 py-3">
									Sign In
								</Button>
							</Link>
						</div>
					)}
				</div>

				{/* Pricing Section */}
				<section className="max-w-5xl mx-auto mb-16">
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
							>
								<div className="mb-4">
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
									onClick={() => handlePlanSelection(plan)}
								>
									{plan.cta}
								</Button>
							</div>
						))}
					</div>
				</section>
			</main>

			<SiteFooter />
		</div>
	);
}
