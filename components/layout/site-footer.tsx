import Link from "next/link"
import { MapPin, AlertCircle } from "lucide-react"

export function SiteFooter() {
	return (
		<footer className="bg-gray-50 border-t mt-16">
			<div className="container mx-auto px-4 py-12">
				{/* Main Footer Content */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
					{/* Brand Section */}
					<div className="col-span-1 md:col-span-1">
						<div className="flex items-center space-x-2 mb-4">
							<MapPin className="w-8 h-8 text-blue-600" />
							<div>
								<span className="text-xl font-bold text-gray-900 block">Park Algo</span>
								<span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
									AI POWERED
								</span>
							</div>
						</div>
						<p className="text-gray-600 text-sm mb-4">
							AI-powered parking solutions that help you park smarter, faster, and stress-free.
						</p>
						<div className="bg-amber-100 border border-amber-300 rounded-lg p-3">
							<div className="flex items-center space-x-2">
								<AlertCircle className="w-4 h-4 text-amber-600" />
								<span className="text-xs font-semibold text-amber-800">BETA TESTING</span>
							</div>
							<p className="text-xs text-amber-700 mt-1">
								Currently in test mode - no real payments processed
							</p>
						</div>
					</div>

					{/* Product Links */}
					<div className="col-span-1">
						<h3 className="font-semibold text-gray-900 mb-4">Product</h3>
						<ul className="space-y-3 text-sm">
							<li>
								<Link href="/smart-parking" className="text-gray-600 hover:text-blue-600 transition-colors">
									Smart Parking
								</Link>
							</li>
							<li>
								<Link href="/parking-finder" className="text-gray-600 hover:text-blue-600 transition-colors">
									Parking Finder
								</Link>
							</li>
							<li>
								<Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
									Dashboard
								</Link>
							</li>
							<li>
								<Link href="/auth/signup" className="text-gray-600 hover:text-blue-600 transition-colors">
									Get Started
								</Link>
							</li>
						</ul>
					</div>

					{/* Support Links */}
					<div className="col-span-1">
						<h3 className="font-semibold text-gray-900 mb-4">Support</h3>
						<ul className="space-y-3 text-sm">
							<li>
								<Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
									Contact Us
								</Link>
							</li>
							<li>
								<Link href="/faq" className="text-gray-600 hover:text-blue-600 transition-colors">
									FAQ
								</Link>
							</li>
							<li>
								<a href="mailto:support@[COMPANY_DOMAIN]" className="text-gray-600 hover:text-blue-600 transition-colors">
									Email Support
								</a>
							</li>
							<li>
								<span className="text-gray-500 text-xs">
									Response time: 24-48 hours
								</span>
							</li>
						</ul>
					</div>

					{/* Legal Links */}
					<div className="col-span-1">
						<h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
						<ul className="space-y-3 text-sm">
							<li>
								<Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
									Terms of Use
								</Link>
							</li>
							<li>
								<Link href="/consent-settings" className="text-gray-600 hover:text-blue-600 transition-colors">
									Cookie Settings
								</Link>
							</li>
							<li>
								<Link href="/privacy#gdpr" className="text-gray-600 hover:text-blue-600 transition-colors">
									GDPR Rights
								</Link>
							</li>
							<li>
								<Link href="/privacy#ccpa" className="text-gray-600 hover:text-blue-600 transition-colors">
									CCPA Rights
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Footer */}
				<div className="border-t border-gray-200 pt-6">
					<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
						<div className="flex flex-wrap items-center justify-center md:justify-start space-x-6 text-sm text-gray-600">
							<Link href="/privacy" className="hover:text-blue-600 transition-colors">
								Privacy
							</Link>
							<Link href="/terms" className="hover:text-blue-600 transition-colors">
								Terms
							</Link>
							<Link href="/consent-settings" className="hover:text-blue-600 transition-colors">
								Cookies
							</Link>
							<Link href="/contact" className="hover:text-blue-600 transition-colors">
								Contact
							</Link>
							<Link href="/faq" className="hover:text-blue-600 transition-colors">
								FAQ
							</Link>
						</div>
						<div className="text-center md:text-right">
							<p className="text-gray-600 text-sm">
								© 2024 Park Algo. All rights reserved.
							</p>
							<p className="text-gray-500 text-xs mt-1">
								Powered by AI, Stripe & Supabase
							</p>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}
