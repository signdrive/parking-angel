import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AnalyticsProvider } from "@/components/firebase/analytics-provider"
import { PWAProvider } from "@/components/pwa/pwa-provider"
import { SupabaseBoundary } from "@/components/error-boundaries/supabase-boundary"
import { Suspense } from "react"
import { AIAssistantProvider } from "@/components/ai/ai-assistant-context"
import { FloatingAIChat } from "@/components/ai/floating-ai-chat"
import Loading from "./loading"
import { ConsentProvider } from "@/hooks/use-consent"
import { ConsentScreen } from "@/components/consent/consent-screen"

const inter = Inter({ subsets: ["latin"] })

// Configure Mapbox on app initialization
if (typeof window !== 'undefined') {
  import("@/lib/mapbox-config").then(({ configureMapbox }) => {
    configureMapbox()
  })
}

export const metadata: Metadata = {
  title: "Park Algo - AI-Powered Parking Solutions",
  description: "Find parking spots in real-time with AI-powered predictions and smart recommendations. Park Algo helps you park smarter!",
  keywords: "parking, AI, real-time, smart parking, machine learning, predictions, park algo",
  generator: "v0.dev",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Park Algo",
  },
  formatDetection: {
    telephone: false,
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
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<Loading />}>
            <SupabaseBoundary>
              <AuthProvider>
                <AnalyticsProvider>
                  <PWAProvider>
                    <ConsentProvider>
                      <AIAssistantProvider>
                        <main className="min-h-screen bg-background">
                          {children}
                          <FloatingAIChat />
                          <Toaster />
                        </main>
                        <ConsentScreen />
                      </AIAssistantProvider>
                    </ConsentProvider>
                  </PWAProvider>
                </AnalyticsProvider>
              </AuthProvider>
            </SupabaseBoundary>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
