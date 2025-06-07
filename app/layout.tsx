import { Toaster } from "@/components/ui/sonner"
import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { NavigationProvider } from "@/components/navigation/navigation-provider"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <NavigationProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <PWAProvider>
              <SupabaseBoundary>
                <Toaster />
                <PWAInstallBanner />
                {children}
              </SupabaseBoundary>
            </PWAProvider>
          </ThemeProvider>
        </NavigationProvider>
      </body>
    </html>
  )
}
