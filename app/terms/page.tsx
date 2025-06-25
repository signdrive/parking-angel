"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Scale, Shield, AlertTriangle, Calendar } from "lucide-react"
import { SiteFooter } from "@/components/layout/site-footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Use
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
            <Calendar className="w-4 h-4" />
            <span>Last updated: June 25, 2025</span>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Please read these Terms of Use carefully before using Park Algo. 
            By accessing or using our service, you agree to be bound by these terms.
          </p>
        </div>

        <div className="space-y-8">
          {/* Acceptance */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                By accessing or using the Park Algo mobile application, website, or any related 
                services (collectively, the "Service"), you agree to be bound by these Terms of Use 
                ("Terms"). If you do not agree to these Terms, please do not use our Service.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you and Park Algo 
                ("Park Algo", "we", "us", or "our"). You represent that you have the legal capacity 
                to enter into this agreement.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 font-medium">
                  ⚠️ Important: By clicking "Accept", creating an account, or using our Service, 
                  you acknowledge that you have read, understood, and agree to these Terms.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Description of Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Park Algo is an AI-powered parking assistance platform that helps users:
              </p>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>• Find available parking spaces in real-time</li>
                <li>• Navigate to parking locations</li>
                <li>• Access parking predictions and recommendations</li>
                <li>• Manage parking preferences and history</li>
                <li>• Connect with parking providers and services</li>
              </ul>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Service Availability</h4>
                <p className="text-blue-800 text-sm">
                  Our Service is provided "as-is" and may be subject to limitations, delays, 
                  and other problems inherent in the use of internet and mobile technologies. 
                  We do not guarantee that parking spots shown as available will remain available 
                  when you arrive.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>User Accounts & Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Account Creation</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• You must be at least 13 years old to create an account</li>
                    <li>• You must provide accurate and complete information</li>
                    <li>• You are responsible for maintaining account security</li>
                    <li>• One person may not maintain multiple accounts</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Account Security</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Keep your password secure and confidential</li>
                    <li>• Notify us immediately of any unauthorized access</li>
                    <li>• You are responsible for all activities under your account</li>
                    <li>• We may suspend accounts showing suspicious activity</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Prohibited Uses</h4>
                  <p className="text-gray-600 mb-3">You agree not to use our Service to:</p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Violate any laws or regulations</li>
                    <li>• Infringe on intellectual property rights</li>
                    <li>• Transmit malicious code or attempt to hack our systems</li>
                    <li>• Use automated scripts or bots without permission</li>
                    <li>• Interfere with other users' enjoyment of the Service</li>
                    <li>• Provide false or misleading parking information</li>
                    <li>• Use the Service for commercial purposes without authorization</li>
                    <li>• Attempt to reverse engineer our algorithms or software</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription & Payments */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Subscriptions & Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Subscription Plans</h4>
                  <p className="text-gray-600 mb-3">
                    We offer various subscription plans with different features and pricing. 
                    Current plans include:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• <strong>Starter:</strong> Free plan with limited features</li>
                    <li>• <strong>Navigator:</strong> Monthly subscription for enhanced features</li>
                    <li>• <strong>Pro Parker:</strong> Premium plan with advanced AI features</li>
                    <li>• <strong>Fleet Manager:</strong> Business plan for multiple vehicles</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Billing & Renewals</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Subscriptions renew automatically unless cancelled</li>
                    <li>• You will be charged at the beginning of each billing period</li>
                    <li>• Price changes will be communicated 30 days in advance</li>
                    <li>• Failed payments may result in service suspension</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Cancellation & Refunds</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• You may cancel your subscription at any time</li>
                    <li>• Cancellation takes effect at the end of your current billing period</li>
                    <li>• We offer a 30-day money-back guarantee for first-time subscribers</li>
                    <li>• Refunds are processed within 5-10 business days</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Beta Testing Notice</h4>
                  <p className="text-green-800 text-sm">
                    During our beta testing phase, no actual payments will be processed. 
                    All payment features are for testing purposes only.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Our Rights</h4>
                  <p className="text-gray-600 mb-3">
                    The Service and its content, features, and functionality are owned by Park Algo 
                    and are protected by international copyright, trademark, patent, and other 
                    intellectual property laws.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• All software, algorithms, and AI models are proprietary</li>
                    <li>• Park Algo name, logo, and branding are our trademarks</li>
                    <li>• You may not copy, modify, or distribute our content without permission</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Your Content</h4>
                  <p className="text-gray-600 mb-3">
                    You retain ownership of content you submit to our Service (reviews, reports, feedback). 
                    However, you grant us a license to use this content to improve our Service.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• You warrant that your content doesn't infringe others' rights</li>
                    <li>• We may remove content that violates these Terms</li>
                    <li>• You're responsible for backing up your important data</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Third-Party Content</h4>
                  <p className="text-gray-600">
                    Our Service includes content from third parties (maps, parking data, etc.). 
                    This content is owned by respective third parties and subject to their terms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Privacy & Data Use
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Your privacy is important to us. Our collection and use of personal information 
                is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <ul className="space-y-2 text-gray-600 mb-4">
                <li>• We collect location data to provide parking search functionality</li>
                <li>• We use analytics to improve our Service</li>
                <li>• We never sell your personal information to third parties</li>
                <li>• You can control your privacy settings in your account</li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  Please review our <a href="/privacy" className="underline font-medium">Privacy Policy</a> 
                  for detailed information about how we collect, use, and protect your data.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Disclaimers & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Service Availability</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Our Service depends on third-party data and may not always be accurate</li>
                    <li>• Parking availability can change rapidly and without notice</li>
                    <li>• We don't guarantee that displayed parking spots will be available</li>
                    <li>• Service may be interrupted for maintenance or technical issues</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">No Warranty</h4>
                  <p className="text-gray-600 mb-3">
                    THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                    EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Accuracy, reliability, or completeness of information</li>
                    <li>• Uninterrupted or error-free operation</li>
                    <li>• Compatibility with your device or other software</li>
                    <li>• Meeting your specific requirements or expectations</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Limitation of Liability</h4>
                  <p className="text-gray-600 mb-3">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, PARK ALGO SHALL NOT BE LIABLE FOR:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Indirect, incidental, or consequential damages</li>
                    <li>• Loss of profits, data, or business opportunities</li>
                    <li>• Parking tickets, fines, or other penalties</li>
                    <li>• Damages resulting from third-party actions or failures</li>
                    <li>• Any amount exceeding the fees paid by you in the past 12 months</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Important Notice</h4>
                  <p className="text-red-800 text-sm">
                    Some jurisdictions do not allow the exclusion of certain warranties or 
                    limitations of liability, so some of the above limitations may not apply to you.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indemnification */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Indemnification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                You agree to indemnify, defend, and hold harmless Park Algo, its officers, 
                directors, employees, and agents from and against any claims, damages, losses, 
                costs, or expenses arising from:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Your use of the Service</li>
                <li>• Your violation of these Terms</li>
                <li>• Your violation of any third-party rights</li>
                <li>• Any content you submit or transmit through the Service</li>
                <li>• Your negligent or wrongful conduct</li>
              </ul>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">By You</h4>
                  <p className="text-gray-600">
                    You may terminate your account at any time by contacting us or using the 
                    account deletion feature in your settings. Upon termination, your access 
                    to paid features will cease at the end of your current billing period.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">By Us</h4>
                  <p className="text-gray-600 mb-3">
                    We may suspend or terminate your access to the Service at any time if:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• You violate these Terms</li>
                    <li>• Your account shows suspicious or fraudulent activity</li>
                    <li>• We decide to discontinue the Service</li>
                    <li>• Required by law or legal process</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Effect of Termination</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Your right to use the Service will cease immediately</li>
                    <li>• We may delete your account and data after 30 days</li>
                    <li>• Provisions regarding liability and disputes will survive termination</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Governing Law & Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Jurisdiction</h4>
                  <p className="text-gray-600">
                    These Terms are governed by the laws of [STATE/COUNTRY], without regard to 
                    conflict of law principles. Any disputes will be resolved in the courts of 
                    [JURISDICTION].
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Dispute Resolution</h4>
                  <p className="text-gray-600 mb-3">
                    We encourage you to contact us first to resolve any disputes informally. 
                    For formal disputes:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Small claims: May be filed in small claims court</li>
                    <li>• Other disputes: Subject to binding arbitration (where permitted by law)</li>
                    <li>• Class actions: Waived to the extent permitted by law</li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">EU Users</h4>
                  <p className="text-gray-600 text-sm">
                    If you are a consumer in the European Union, you may have additional rights 
                    under applicable consumer protection laws, and nothing in these Terms affects 
                    those rights.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Provisions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>General Provisions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Changes to Terms</h4>
                  <p className="text-gray-600">
                    We may update these Terms from time to time. We will notify you of material 
                    changes via email or in-app notification. Continued use constitutes acceptance 
                    of updated Terms.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Entire Agreement</h4>
                  <p className="text-gray-600">
                    These Terms, together with our Privacy Policy, constitute the entire agreement 
                    between you and Park Algo regarding the Service.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Severability</h4>
                  <p className="text-gray-600">
                    If any provision of these Terms is found unenforceable, the remaining provisions 
                    will remain in full force and effect.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Waiver</h4>
                  <p className="text-gray-600">
                    No waiver of any term will be deemed a further or continuing waiver of such 
                    term or any other term.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have questions about these Terms of Use, please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <div><strong>Email:</strong> legal@parkalgo.com</div>
                <div><strong>Support:</strong> support@parkalgo.com</div>
                <div>
                  <strong>Mailing Address:</strong><br />
                  Park Algo<br />
                  Attn: Legal Department<br />
                  [COMPANY_ADDRESS]<br />
                  [CITY], [STATE] [ZIP_CODE]<br />
                  [COUNTRY]
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <SiteFooter />
      </div>
    </div>
  )
}
