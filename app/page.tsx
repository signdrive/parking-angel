// Force static generation for homepage for better SEO crawler compatibility
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

import { Metadata } from "next"
import { HomepageContent } from "./homepage-content"
import { ClientInteractiveComponents } from "./client-components"
import { SiteFooter } from "@/components/layout/site-footer"
import { StructuredData } from "@/components/seo/structured-data"

export const metadata: Metadata = {
  title: "AI Parking Optimization | Smart Algorithms | Parkalgo",
  description: "Transform parking efficiency with AI-powered algorithms. Smart parking management software that reduces congestion & maximizes revenue.",
  keywords: "AI parking optimization, smart parking algorithms, parking management software, automated parking solutions, dynamic parking pricing, cost-effective parking technology, cloud-based parking management",
  robots: "index, follow",
  metadataBase: new URL("https://parkalgo.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AI Parking Optimization Software | Smart Algorithms | Parkalgo",
    description: "Transform parking efficiency with AI-powered algorithms. Reduce congestion & maximize revenue through automated parking solutions.",
    url: "https://parkalgo.com/",
    siteName: "Parkalgo",
    images: [
      {
        url: "https://parkalgo.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Parkalgo AI Parking Optimization Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Parking Optimization Software | Parkalgo",
    description: "Smart parking algorithms that reduce congestion & maximize revenue through AI-powered automation.",
    images: ["https://parkalgo.com/og-image.jpg"],
  },
}

export default function HomePage() {
  return (
    <>
      {/* Server-rendered content for SEO */}
      <HomepageContent />
      
      {/* Client-side interactive components */}
      <ClientInteractiveComponents />
      
      {/* Footer */}
      <SiteFooter />

      {/* Structured Data for SEO */}
      <StructuredData type="software" />
      <StructuredData type="organization" />
      <StructuredData type="website" />
      <StructuredData type="faq" />
    </>
  )
}
