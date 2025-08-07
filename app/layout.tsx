import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { GoogleAnalytics } from '@next/third-parties/google'
import { GoogleAnalyticsProvider } from '@/components/analytics/google-analytics-provider'
import { type PropsWithChildren } from "react"
import "./globals.css" // This will be automatically optimized by Next.js
import { AuthProvider } from "@/components/auth/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AnalyticsProvider } from "@/components/firebase/analytics-provider"
import { PWAProvider } from "@/components/pwa/pwa-provider"
import { SupabaseBoundary } from "@/components/error-boundaries/supabase-boundary"
import { RSCErrorBoundary } from "@/components/error-boundaries/rsc-error-boundary"
import { Suspense } from "react"
import { AIAssistantProvider } from "@/components/ai/ai-assistant-context"
import { FloatingAIChat } from "@/components/ai/floating-ai-chat"
import Loading from "./loading"
import { ConsentProvider } from "@/hooks/use-consent"
import { ConsentScreen } from "@/components/consent/consent-screen"
import { ServiceWorkerInit } from "@/components/pwa/service-worker-init"
// Import session error handler to activate global error handling
import "@/lib/supabase/error-handler"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

// Configure Mapbox on app initialization
if (typeof window !== 'undefined') {
  import("@/lib/mapbox-config").then(({ configureMapbox }) => {
    configureMapbox()
  })
}

export const metadata: Metadata = {
  metadataBase: new URL('https://parkalgo.com'),
  title: "AI Parking Optimization | Smart Algorithms | Parkalgo",
  description: "Transform parking efficiency with AI-powered algorithms. Smart parking management software that reduces congestion & maximizes revenue.",
  keywords: "AI parking optimization, smart parking algorithms, parking management software, automated parking solutions, dynamic parking pricing, cost-effective parking technology, cloud-based parking management",
  generator: "Next.js",
  manifest: process.env.NODE_ENV === 'production' ? "/manifest.json" : undefined,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Parkalgo - AI Parking",
  },
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: 'https://parkalgo.com/',
  },
  openGraph: {
    title: "AI Parking Optimization Software | Smart Algorithms | Parkalgo",
    description: "Transform parking efficiency with AI-powered algorithms. Reduce congestion & maximize revenue through automated parking solutions.",
    url: "https://parkalgo.com/",
    siteName: "Parkalgo",
    type: "website",
    images: [
      {
        url: "https://parkalgo.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Parkalgo AI Parking Optimization Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Parking Optimization Software | Parkalgo",
    description: "Smart parking algorithms that reduce congestion & maximize revenue through AI-powered automation.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
}

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="fo-verify" content="64d238c9-56d8-4dfd-9f36-30590901236b" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && process.env.NODE_ENV === 'production' && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </head>
      <body className={inter.className}>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && process.env.NODE_ENV === 'production' && (
          <GoogleAnalyticsProvider />
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConsentProvider>
            <AuthProvider>
              <AnalyticsProvider>
                <PWAProvider>
                  <AIAssistantProvider>
                    <SupabaseBoundary>
                      <RSCErrorBoundary>
                        <Suspense fallback={<Loading />}>
                          {children}
                          <FloatingAIChat />
                          <ConsentScreen />
                          <ServiceWorkerInit />
                        </Suspense>
                      </RSCErrorBoundary>
                    </SupabaseBoundary>
                  </AIAssistantProvider>
                </PWAProvider>
              </AnalyticsProvider>
            </AuthProvider>
          </ConsentProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
