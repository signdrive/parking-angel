import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Parkalgo - AI Parking Management',
  description: 'Access your AI-powered parking management dashboard with real-time analytics, smart parking solutions, and intelligent optimization tools.',
  robots: {
    index: false, // Dashboard should not be indexed
    follow: false,
  },
  alternates: {
    canonical: 'https://parkalgo.com/dashboard',
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
