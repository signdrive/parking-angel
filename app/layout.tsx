import { Toaster } from "@/components/ui/sonner"
import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { NavigationProvider } from "@/components/navigation/navigation-provider"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { PWAProvider } from "@/components/pwa/pwa-provider"
import { SupabaseBoundary } from "@/components/error-boundaries/supabase-boundary"
import PWAInstallBanner from "@/components/pwa/install-banner"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Parking Angel - AI-Powered Parking Solutions",
  description: "Find parking spots in real-time with AI-powered predictions and smart recommendations.",
  keywords: ["parking", "AI", "real-time", "smart parking", "machine learning", "predictions"],
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
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "msapplication-TileColor": "#3b82f6",
    "msapplication-TileImage": "/icon-192x192.png", // Ensure this path is correct
    "msapplication-tap-highlight": "no",
    "mobile-web-app-capable": "yes",
    "mobile-web-app-title": "Parking Angel",
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
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NavigationProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <PWAProvider>
              <SupabaseBoundary>
                <Toaster />
                <PWAInstallBanner />
                <Suspense fallback={null}>{children}</Suspense>
              </SupabaseBoundary>
            </PWAProvider>
          </ThemeProvider>
        </NavigationProvider>
      </body>
    </html>
  )
}
