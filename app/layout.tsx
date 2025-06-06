import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AnalyticsProvider } from "@/components/firebase/analytics-provider"
import { PWAProvider } from "@/components/pwa/pwa-provider"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Parking Angel - AI-Powered Parking Solutions",
  description: "Find parking spots in real-time with AI-powered predictions and smart recommendations.",
  keywords: "parking, AI, real-time, smart parking, machine learning, predictions",
  generator: "v0.dev",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Parking Angel",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Parking Angel",
    title: "Parking Angel - AI-Powered Parking Solutions",
    description: "Find parking spots in real-time with AI-powered predictions and smart recommendations.",
  },
  twitter: {
    card: "summary",
    title: "Parking Angel - AI-Powered Parking Solutions",
    description: "Find parking spots in real-time with AI-powered predictions and smart recommendations.",
  },
}

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Parking Angel" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <AnalyticsProvider>
              <PWAProvider>
                <Suspense fallback={null}>{children}</Suspense>
                <Toaster />
              </PWAProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
