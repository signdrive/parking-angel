import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Parkalgo - Smart Parking Insights',
  description: 'Latest insights, tips, and updates about smart parking management, AI optimization, and urban mobility solutions.',
  alternates: {
    canonical: 'https://parkalgo.com/blog',
  },
  openGraph: {
    title: 'Blog | Parkalgo - Smart Parking Insights',
    description: 'Latest insights, tips, and updates about smart parking management, AI optimization, and urban mobility solutions.',
    url: 'https://parkalgo.com/blog',
    siteName: 'Parkalgo',
    type: 'website',
    images: [{
      url: 'https://parkalgo.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Parkalgo Blog'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Parkalgo - Smart Parking Insights',
    description: 'Latest insights, tips, and updates about smart parking management.',
    images: ['https://parkalgo.com/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  }
};
