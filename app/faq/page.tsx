"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, HelpCircle, MessageSquare, User, CreditCard, Shield, Settings } from "lucide-react"
import { SiteFooter } from "@/components/layout/site-footer"

const faqCategories = [
	{
		id: "account",
		title: "Account & Getting Started",
		icon: User,
		color: "text-blue-600",
		questions: [
			{
				question: "How do I create an account?",
				answer: "You can create an account by clicking 'Get Started' on our homepage and signing up with your email address or Google account. It's completely free to get started with our Starter plan.",
			},
			{
				question: "What's included in the free Starter plan?",
				answer: "The Starter plan includes 5 searches per day, access to our basic parking map, community reports from other users, and email support. Perfect for occasional parking needs!",
			},
			{
				question: "How do I reset my password?",
				answer: "Click 'Forgot Password' on the login page and enter your email address. We'll send you a secure link to reset your password. If you signed up with Google, you can use Google's password recovery process.",
			},
			{
				question: "Can I change my email address?",
				answer: "Yes! Go to your account settings and update your email address. You'll need to verify the new email before the change takes effect.",
			},
			{
				question: "How do I delete my account?",
				answer: "You can delete your account from the Privacy & Security section in your account settings. Please note that this action is permanent and cannot be undone. All your data will be permanently removed.",
			},
		],
	},
	{
		id: "payments",
		title: "Payments & Subscriptions",
		icon: CreditCard,
		color: "text-green-600",
		questions: [
			{
				question: "What payment methods do you accept?",
				answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and digital wallets through our secure Stripe payment processor. All payments are encrypted and secure.",
			},
			{
				question: "How much do the paid plans cost?",
				answer: "Navigator plan is $8.99/month with unlimited searches and ad-free experience. Pro Parker is $19.99/month with advanced features like AI predictions and priority support. Fleet Manager is $49.99/month for businesses managing multiple vehicles.",
			},
			{
				question: "Can I cancel my subscription anytime?",
				answer: "Absolutely! You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period, and you won't be charged again.",
			},
			{
				question: "Do you offer refunds?",
				answer: "We offer a 30-day money-back guarantee for first-time subscribers. If you're not satisfied within the first 30 days, contact our support team for a full refund.",
			},
			{
				question: "What happens if my payment fails?",
				answer: "If a payment fails, we'll retry the charge and send you an email notification. You'll have 7 days to update your payment method before your account is downgraded to the free Starter plan.",
			},
			{
				question: "Are payments secure?",
				answer: "Yes! All payments are processed through Stripe, a leading payment processor that's PCI DSS compliant. We never store your credit card information on our servers.",
			},
		],
	},
	{
		id: "privacy",
		title: "Privacy & Security",
		icon: Shield,
		color: "text-purple-600",
		questions: [
			{
				question: "What data do you collect?",
				answer: "We collect basic account information (email, name), location data when you search for parking (to provide relevant results), and usage analytics to improve our service. You can view all collected data in your Privacy Dashboard.",
			},
			{
				question: "How do you use my location data?",
				answer: "Location data is used solely to find parking spots near you and provide accurate directions. We don't share your location with third parties or use it for advertising. You can disable location services anytime in your settings.",
			},
			{
				question: "Do you share my data with third parties?",
				answer: "We only share anonymized, aggregated data with parking providers to improve availability information. We never sell personal information or share identifiable data with advertisers or other third parties.",
			},
			{
				question: "How can I download my data?",
				answer: "You can download all your personal data from the Privacy & Security section in your account settings. We'll provide a comprehensive export of your account information, search history, and preferences.",
			},
			{
				question: "How do I control my privacy settings?",
				answer: "Visit your Privacy Dashboard to control data collection, location sharing, marketing communications, and more. You have granular control over what data we collect and how it's used.",
			},
		],
	},
	{
		id: "troubleshooting",
		title: "Troubleshooting & Technical",
		icon: Settings,
		color: "text-orange-600",
		questions: [
			{
				question: "The app isn't finding parking spots near me. What should I do?",
				answer: "First, ensure location services are enabled for Park Algo. Check your internet connection and try refreshing the search. If the issue persists, try logging out and back in, or contact our support team.",
			},
			{
				question: "Why are some parking spots showing as unavailable?",
				answer: "Parking availability is updated in real-time, but sometimes spots can be taken between our last update and your arrival. We're constantly improving our prediction accuracy with AI technology.",
			},
			{
				question: "The map isn't loading properly. How can I fix this?",
				answer: "Try refreshing the page or restarting the app. Ensure you have a stable internet connection. If you're using a browser, try clearing your cache or using an incognito/private window.",
			},
			{
				question: "I'm not receiving email notifications. What's wrong?",
				answer: "Check your spam/junk folder first. Ensure notifications are enabled in your account settings. Add support@parkalgo.com to your contacts to prevent emails from being filtered.",
			},
			{
				question: "The app is running slowly. How can I improve performance?",
				answer: "Close other applications to free up memory, ensure you have the latest version of the app, and check your internet connection speed. For browsers, try clearing cache and cookies.",
			},
			{
				question: "I found incorrect parking information. How do I report it?",
				answer: "Use the 'Report Issue' button on any parking spot to flag incorrect information. Our team reviews all reports and updates the data accordingly. Community reports help keep our information accurate!",
			},
		],
	},
]

export default function FAQPage() {
	const [openItems, setOpenItems] = useState<string[]>([])

	const toggleItem = (itemId: string) => {
		setOpenItems((prev) =>
			prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
			<div className="container mx-auto px-4 max-w-4xl">
				{/* Header */}
				<div className="text-center mb-12">
					<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<HelpCircle className="w-8 h-8 text-blue-600" />
					</div>
					<h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Find answers to common questions about Park Algo. Can't find what you're looking for?
						<br /> We're here to help!
					</p>
				</div>

				{/* FAQ Categories */}
				<div className="space-y-8">
					{faqCategories.map((category) => (
						<Card key={category.id} className="shadow-lg">
							<CardHeader>
								<CardTitle className="flex items-center gap-3">
									<category.icon className={`w-6 h-6 ${category.color}`} />
									{category.title}
								</CardTitle>
								<CardDescription>
									Common questions about {category.title.toLowerCase()}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{category.questions.map((faq, index) => {
										const itemId = `${category.id}-${index}`
										const isOpen = openItems.includes(itemId)

										return (
											<Collapsible key={itemId}>
												<CollapsibleTrigger
													onClick={() => toggleItem(itemId)}
													className="flex items-center justify-between w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
												>
													<span className="font-medium text-gray-900 pr-4">
														{faq.question}
													</span>
													{isOpen ? (
														<ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
													) : (
														<ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
													)}
												</CollapsibleTrigger>
												<CollapsibleContent className="px-4 pb-4">
													<div className="pt-4 text-gray-600 leading-relaxed">
														{faq.answer}
													</div>
												</CollapsibleContent>
											</Collapsible>
										)
									})}
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Still Need Help CTA */}
				<Card className="mt-12 shadow-lg">
					<CardContent className="text-center py-12">
						<MessageSquare className="w-16 h-16 text-blue-600 mx-auto mb-6" />
						<h2 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
						<p className="text-gray-600 mb-6 max-w-2xl mx-auto">
							Can't find the answer you're looking for? Our friendly support team is here to help.
							<br /> We typically respond within 24-48 hours.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" asChild>
								<a href="/contact">Contact Support</a>
							</Button>
							<Button size="lg" variant="outline" asChild>
								<a href="mailto:support@parkalgo.com">Email Us Directly</a>
							</Button>
						</div>
						<p className="text-sm text-gray-500 mt-4">
							Pro Parker and Fleet Manager subscribers receive priority support
						</p>
					</CardContent>
				</Card>

				{/* Quick Tips */}
				<div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
					<h3 className="font-semibold text-blue-900 mb-3">
						💡 Quick Tips for Better Support
					</h3>
					<ul className="text-sm text-blue-800 space-y-2">
						<li>• Include your account email when contacting support</li>
						<li>• Describe the issue with specific steps to reproduce it</li>
						<li>• Mention your device type and browser/app version</li>
						<li>• Check our System Status page for known issues</li>
					</ul>
				</div>
			</div>

			<SiteFooter />
		</div>
	)
}
