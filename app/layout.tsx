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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Parking Angel",
    startupImage: [
      {
        url: "/apple-splash-2048-2732.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/apple-splash-1668-2224.png",
        media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Parking Angel",
    title: "Parking Angel - AI-Powered Parking Solutions",
    description: "Find parking spots in real-time with AI-powered predictions and smart recommendations.",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Parking Angel Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Parking Angel - AI-Powered Parking Solutions",
    description: "Find parking spots in real-time with AI-powered predictions and smart recommendations.",
    images: ["/icon-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/apple-touch-icon-167x167.png", sizes: "167x167", type: "image/png" },
      { url: "/apple-touch-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#3b82f6",
      },
    ],
  },
  other: {
    "msapplication-TileColor": "#3b82f6",
    "msapplication-TileImage": "/icon-192x192.png",
    "msapplication-config": "/browserconfig.xml",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
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
        {/* Primary PWA Manifest */}
        <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />

        {/* Fallback Manifest for older browsers */}
        <link rel="manifest" href="/manifest.json" />

        {/* Primary Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png" />

        {/* Precomposed Icons for older iOS */}
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png" />

        {/* Standard Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" href="/favicon.ico" />

        {/* Safari Pinned Tab */}
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3b82f6" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-TileImage" content="/icon-192x192.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Apple Web App Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Parking Angel" />
        <meta name="apple-touch-fullscreen" content="yes" />

        {/* Mobile Web App Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-title" content="Parking Angel" />

        {/* Additional PWA Meta Tags */}
        <meta name="application-name" content="Parking Angel" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="format-detection" content="telephone=no" />

        {/* Preload Critical Resources */}
        <link rel="preload" href="/icon-192x192.png" as="image" type="image/png" />
        <link rel="preload" href="/apple-touch-icon.png" as="image" type="image/png" />
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
