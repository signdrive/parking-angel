"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Download, Mail, Globe, Calendar } from "lucide-react"
import { SiteFooter } from "@/components/layout/site-footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
            <Calendar className="w-4 h-4" />
            <span>Last updated: June 25, 2025</span>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how Park Algo collects, 
            uses, and protects your personal information.
          </p>
        </div>

        <div className="space-y-8">
          {/* Overview */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Park Algo ("Park Algo", "we", "us", or "our") is committed to protecting 
                your privacy and ensuring transparency about how we collect, use, and share 
                your personal information. This Privacy Policy applies to our mobile application, 
                website, and related services (collectively, the "Service").
              </p>
              <p>
                By using our Service, you agree to the collection and use of information in 
                accordance with this policy. We comply with applicable data protection laws, 
                including the EU General Data Protection Regulation (GDPR) and California 
                Consumer Privacy Act (CCPA).
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Personal Information You Provide
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>Account Information:</strong> Email address, name, password (encrypted)</li>
                  <li>• <strong>Profile Information:</strong> Optional profile picture, preferences</li>
                  <li>• <strong>Payment Information:</strong> Billing address, payment method details (processed securely by Stripe)</li>
                  <li>• <strong>Communication Data:</strong> Messages you send to our support team</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Information Automatically Collected
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>Location Data:</strong> GPS coordinates when you search for parking (with your permission)</li>
                  <li>• <strong>Device Information:</strong> Device type, operating system, browser version</li>
                  <li>• <strong>Usage Analytics:</strong> How you interact with our app, features used, search patterns</li>
                  <li>• <strong>Log Data:</strong> IP address, access times, pages viewed, crashes, and errors</li>
                  <li>• <strong>Cookies & Tracking:</strong> Essential cookies for functionality, analytics cookies (with consent)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Information from Third Parties
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>Social Login:</strong> Basic profile information if you sign in with Google</li>
                  <li>• <strong>Parking Partners:</strong> Real-time availability data from parking providers</li>
                  <li>• <strong>Map Services:</strong> Location and mapping data from Mapbox</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Core Service Functionality</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Find and display parking spots near your location</li>
                    <li>• Provide turn-by-turn navigation to parking spots</li>
                    <li>• Process payments and manage subscriptions</li>
                    <li>• Send service-related notifications and updates</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Service Improvement</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Analyze usage patterns to improve our AI algorithms</li>
                    <li>• Develop new features based on user needs</li>
                    <li>• Monitor and improve app performance and reliability</li>
                    <li>• Conduct research and analytics (using anonymized data)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Communication & Support</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Respond to your questions and provide customer support</li>
                    <li>• Send important account and service updates</li>
                    <li>• Share product updates and new features (with your consent)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Legal & Security</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Comply with legal obligations and law enforcement requests</li>
                    <li>• Protect against fraud, abuse, and security threats</li>
                    <li>• Enforce our Terms of Service and other policies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>How We Share Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium">
                  🔒 We never sell your personal information to third parties.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Service Providers</h4>
                  <p className="text-gray-600 mb-2">
                    We share information with trusted third-party service providers who help us operate our service:
                  </p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• <strong>Payment Processing:</strong> Stripe (for secure payment processing)</li>
                    <li>• <strong>Cloud Services:</strong> Supabase (for database and authentication)</li>
                    <li>• <strong>Maps & Location:</strong> Mapbox (for mapping and geocoding)</li>
                    <li>• <strong>Analytics:</strong> Anonymized usage data for service improvement</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Business Transfers</h4>
                  <p className="text-gray-600">
                    If we are acquired by or merged with another company, your information may be 
                    transferred as part of that transaction. We will notify you of any such change.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Legal Requirements</h4>
                  <p className="text-gray-600">
                    We may disclose your information if required by law, court order, or to protect 
                    our rights, users, or the public from harm.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Aggregated Data</h4>
                  <p className="text-gray-600">
                    We may share anonymized, aggregated data that cannot identify you personally 
                    (e.g., parking usage trends) with parking partners to improve availability predictions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights & Choices */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Your Rights & Choices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Your Data Rights (GDPR & CCPA)</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-gray-900">Access</h5>
                        <p className="text-sm text-gray-600">Request a copy of your personal data</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">Rectification</h5>
                        <p className="text-sm text-gray-600">Correct inaccurate or incomplete data</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">Deletion</h5>
                        <p className="text-sm text-gray-600">Request deletion of your personal data</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-gray-900">Portability</h5>
                        <p className="text-sm text-gray-600">Export your data in a portable format</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">Restriction</h5>
                        <p className="text-sm text-gray-600">Limit how we process your data</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">Objection</h5>
                        <p className="text-sm text-gray-600">Object to certain data processing</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">How to Exercise Your Rights</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 mb-2">
                      <strong>Privacy Dashboard:</strong> Access most privacy controls directly in your account settings
                    </p>
                    <p className="text-blue-800 mb-2">
                      <strong>Email:</strong> Contact our Data Protection Officer at privacy@parkalgo.com
                    </p>
                    <p className="text-blue-800">
                      <strong>Response Time:</strong> We will respond to your request within 30 days
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Marketing Communications</h4>
                  <p className="text-gray-600 mb-2">
                    You can opt out of marketing emails at any time by:
                  </p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Clicking "Unsubscribe" in any marketing email</li>
                    <li>• Updating your preferences in account settings</li>
                    <li>• Contacting our support team</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Location Data Controls</h4>
                  <p className="text-gray-600 mb-2">
                    You can control location access:
                  </p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Device settings: Enable/disable location permissions</li>
                    <li>• App settings: Choose when to share location</li>
                    <li>• Note: Disabling location will limit core parking search functionality</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security & Retention */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Data Security & Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Security Measures</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• <strong>Encryption:</strong> All data encrypted in transit (TLS) and at rest (AES-256)</li>
                    <li>• <strong>Access Controls:</strong> Strict employee access controls and regular security training</li>
                    <li>• <strong>Infrastructure:</strong> Hosted on secure, SOC 2 compliant cloud platforms</li>
                    <li>• <strong>Monitoring:</strong> 24/7 security monitoring and incident response</li>
                    <li>• <strong>Payments:</strong> PCI DSS compliant payment processing (we don't store card data)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Data Retention</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-900">Account Data</span>
                      <span className="text-gray-600">Until account deletion + 30 days</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-900">Location Data</span>
                      <span className="text-gray-600">Anonymized after 90 days</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-900">Usage Analytics</span>
                      <span className="text-gray-600">Aggregated data retained indefinitely</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-900">Support Communications</span>
                      <span className="text-gray-600">3 years for quality assurance</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• <strong>EU Users:</strong> Data transfers comply with GDPR requirements (adequacy decisions, SCCs)</li>
                <li>• <strong>Hosting:</strong> Primary data stored in secure data centers within your region when possible</li>
                <li>• <strong>Service Providers:</strong> All international partners have appropriate data protection agreements</li>
              </ul>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Our Service is not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13. If you become aware that a 
                child has provided us with personal information, please contact us immediately and 
                we will take steps to remove that information.
              </p>
              <p className="text-gray-600">
                For users between 13-18, we recommend parental involvement in account creation and privacy settings.
              </p>
            </CardContent>
          </Card>

          {/* Policy Updates */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Policy Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our 
                practices or applicable law. When we make material changes:
              </p>
              <ul className="space-y-2 text-gray-600 mb-4">
                <li>• We will notify you via email or in-app notification</li>
                <li>• We will update the "Last updated" date at the top of this policy</li>
                <li>• For significant changes, we may require your explicit consent</li>
                <li>• Previous versions will be available upon request</li>
              </ul>
              <p className="text-gray-600">
                Your continued use of our Service after any changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have questions about this Privacy Policy or our privacy practices:
              </p>
              <div className="space-y-3 text-gray-600">
                <div>
                  <strong>Privacy Officer:</strong> privacy@parkalgo.com
                </div>
                <div>
                  <strong>General Support:</strong> support@parkalgo.com
                </div>
                <div>
                  <strong>Mailing Address:</strong><br />
                  Park Algo<br />
                  Attn: Privacy Officer<br />
                  [COMPANY_ADDRESS]<br />
                  [CITY], [STATE] [ZIP_CODE]<br />
                  [COUNTRY]
                </div>
                <div>
                  <strong>EU Representative:</strong> [EU_REPRESENTATIVE_DETAILS] (if applicable)
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
