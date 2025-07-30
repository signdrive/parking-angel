import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie & Privacy Consent Settings | Parkalgo',
  description: 'Manage your cookie preferences and privacy settings for Parkalgo. Control analytics, marketing, and functional cookies according to your preferences.',
  keywords: 'privacy settings, cookie preferences, consent management, Parkalgo privacy, GDPR compliance',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://parkalgo.com/consent-settings',
  },
  openGraph: {
    title: 'Cookie & Privacy Consent Settings | Parkalgo',
    description: 'Manage your privacy preferences and cookie settings',
    url: 'https://parkalgo.com/consent-settings',
    siteName: 'Parkalgo',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Settings | Parkalgo',
    description: 'Manage your privacy preferences and cookie settings',
  },
}

export default function ConsentSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
