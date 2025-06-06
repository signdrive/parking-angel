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
import Script from "next/script"

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
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
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
        {/* Primary PWA Manifest */}
        <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />

        {/* Primary Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />

        {/* Standard Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
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
        <meta name="msapplication-TileImage" content="/icons/icon-192x192.png" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Preload Critical Resources */}
        <link rel="preload" href="/icon-192x192.png" as="image" type="image/png" />
        <link rel="preload" href="/apple-touch-icon.png" as="image" type="image/png" />
      </head>
      <body className={inter.className}>
        {/* Icon Fallback Script */}
        <Script id="icon-fallback" strategy="beforeInteractive">
          {`
            // Legacy iOS fallback
            if (!document.querySelector('link[rel="apple-touch-icon"]')) {
              const icon = document.createElement('link');
              icon.rel = 'apple-touch-icon';
              icon.href = '/icons/legacy-icon.png';
              document.head.appendChild(icon);
            }
            
            // Manifest fallback
            if (!document.querySelector('link[rel="manifest"]')) {
              const manifest = document.createElement('link');
              manifest.rel = 'manifest';
              manifest.href = '/manifest.webmanifest';
              manifest.crossOrigin = 'use-credentials';
              document.head.appendChild(manifest);
            }
          `}
        </Script>
        {/* Add this script tag with error handling */}
        <Script id="gtag-error-handler" strategy="beforeInteractive">
          {`
            // Handle Google Analytics loading errors gracefully
            window.addEventListener('error', function(e) {
              if (e.filename && e.filename.includes('googletagmanager.com')) {
                console.warn('Google Analytics failed to load - continuing without analytics');
                e.preventDefault();
              }
            });
            
            // Handle unhandled promise rejections from external scripts
            window.addEventListener('unhandledrejection', function(e) {
              if (e.reason && e.reason.toString().includes('gtag')) {
                console.warn('Google Analytics promise rejection - continuing without analytics');
                e.preventDefault();
              }
            });
          `}
        </Script>

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
      </body>
    </html>
  )
}
