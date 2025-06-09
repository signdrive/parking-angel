import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AnalyticsProvider } from "@/components/firebase/analytics-provider"
import { PWAProvider } from "@/components/pwa/pwa-provider"
import { SupabaseBoundary } from "@/components/error-boundaries/supabase-boundary"
import { Suspense } from "react"
import { FetchPatchProvider } from "@/components/fetch-patch-provider"

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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/svg+xml" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/svg+xml" }],
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
        {/* Use the dynamic manifest.json */}
        <link rel="manifest" href="/manifest.json" />

        {/* Primary Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Standard Icons */}
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" href="/favicon.ico" />

        {/* Apple Web App Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Parking Angel" />

        {/* Mobile Web App Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-title" content="Parking Angel" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-TileImage" content="/icon-192x192.png" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <FetchPatchProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SupabaseBoundary>
              <AuthProvider>
                <AnalyticsProvider>
                  <PWAProvider>
                    <Suspense fallback={null}>{children}</Suspense>
                    <Toaster />
                  </PWAProvider>
                </AnalyticsProvider>
              </AuthProvider>
            </SupabaseBoundary>
          </ThemeProvider>
        </FetchPatchProvider>
      </body>
    </html>
  )
}
