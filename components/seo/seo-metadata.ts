import { Metadata } from 'next'

interface SEOConfig {
  title?: string
  description?: string
  keywords?: string[]
  canonicalUrl?: string
  noIndex?: boolean
  ogImage?: string
}

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  canonicalUrl,
  noIndex = false,
  ogImage = '/og-image.jpg'
}: SEOConfig): Metadata {
  const baseTitle = "Parkalgo - AI Parking Optimization"
  const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle
  
  const baseDescription = "Transform parking efficiency with AI-powered algorithms. Smart parking management software that reduces congestion & maximizes revenue."
  const finalDescription = description || baseDescription

  const baseKeywords = [
    'AI parking optimization',
    'smart parking algorithms', 
    'parking management software',
    'automated parking solutions',
    'dynamic parking pricing'
  ]
  
  const allKeywords = [...baseKeywords, ...keywords].join(', ')

  const metadata: Metadata = {
    title: fullTitle,
    description: finalDescription,
    keywords: allKeywords,
    robots: noIndex ? { index: false, follow: false } : { 
      index: true, 
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      }
    },
    openGraph: {
      title: fullTitle,
      description: finalDescription,
      url: canonicalUrl || 'https://www.parkalgo.com',
      siteName: 'Parkalgo',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: finalDescription,
      images: [ogImage],
    },
    alternates: canonicalUrl ? {
      canonical: canonicalUrl
    } : undefined,
  }

  return metadata
}

// Pre-configured metadata for common pages
export const seoConfigs = {
  homepage: generateSEOMetadata({
    title: 'AI Parking Optimization Software | Smart Algorithms',
    description: 'Transform parking efficiency with AI-powered algorithms. Parkalgo\'s smart parking management software reduces congestion & maximizes revenue through automated solutions.',
    keywords: ['best AI for parking lot efficiency', 'cost-effective parking technology', 'cloud-based parking management'],
    canonicalUrl: 'https://www.parkalgo.com'
  }),

  dashboard: generateSEOMetadata({
    title: 'Parking Analytics Dashboard | Real-Time Insights',
    description: 'Monitor parking performance with AI-powered analytics. Real-time occupancy tracking, revenue optimization, and predictive insights for smart parking management.',
    keywords: ['parking analytics dashboard', 'real-time parking data', 'parking utilization rates'],
    canonicalUrl: 'https://www.parkalgo.com/dashboard'
  }),

  pricing: generateSEOMetadata({
    title: 'Dynamic Parking Pricing Solutions | AI-Powered Revenue',
    description: 'Maximize parking revenue with AI-driven dynamic pricing. Smart algorithms adjust rates based on demand, occupancy, and market conditions.',
    keywords: ['dynamic parking pricing', 'parking revenue optimization', 'demand-based parking rates'],
    canonicalUrl: 'https://www.parkalgo.com/pricing'
  }),

  features: generateSEOMetadata({
    title: 'Smart Parking Features | AI Algorithms & Automation',
    description: 'Discover Parkalgo\'s AI-powered parking features: real-time detection, predictive analytics, automated enforcement, and revenue optimization.',
    keywords: ['smart parking features', 'automated parking solutions', 'parking space optimization'],
    canonicalUrl: 'https://www.parkalgo.com/features'
  }),

  blog: generateSEOMetadata({
    title: 'Parking Technology Blog | AI & Smart City Insights',
    description: 'Learn about AI parking optimization, smart city solutions, and parking industry trends. Expert insights on automated parking technology.',
    keywords: ['parking technology blog', 'smart city parking', 'AI parking insights'],
    canonicalUrl: 'https://www.parkalgo.com/blog'
  })
}
