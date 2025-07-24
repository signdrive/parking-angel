"use client"

import Script from 'next/script'

interface StructuredDataProps {
  type: 'software' | 'faq' | 'organization' | 'website' | 'article'
  data?: any
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'software':
        return {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Parkalgo AI Parking Optimization",
          "description": "Smart parking management software with AI algorithms that optimize parking space utilization and reduce congestion",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": ["Web", "iOS", "Android"],
          "offers": {
            "@type": "Offer",
            "price": "Contact for pricing",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "provider": {
            "@type": "Organization",
            "name": "Parkalgo",
            "url": "https://www.parkalgo.com"
          },
          "screenshot": "https://www.parkalgo.com/screenshot.jpg",
          "featureList": [
            "Real-time parking space detection",
            "AI-powered occupancy prediction",
            "Dynamic pricing optimization",
            "Revenue management analytics",
            "Mobile and web applications"
          ]
        }

      case 'faq':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How does AI improve parking efficiency?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "AI improves parking efficiency by analyzing real-time occupancy data, predicting peak usage patterns, and optimizing space allocation through smart algorithms that can increase utilization by up to 40%."
              }
            },
            {
              "@type": "Question", 
              "name": "What are smart parking algorithms?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Smart parking algorithms use machine learning and AI to process data from sensors, cameras, and mobile apps to dynamically manage parking spaces, predict availability, and optimize pricing in real-time."
              }
            },
            {
              "@type": "Question",
              "name": "What is dynamic parking pricing?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Dynamic parking pricing uses AI algorithms to adjust parking rates based on demand, time of day, events, and occupancy levels to maximize revenue while improving space turnover."
              }
            },
            {
              "@type": "Question",
              "name": "How does automated parking management work?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Automated parking management combines IoT sensors, computer vision, and AI algorithms to monitor parking spaces, guide drivers to available spots, process payments, and enforce regulations without human intervention."
              }
            }
          ]
        }

      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Parkalgo",
          "url": "https://www.parkalgo.com",
          "logo": "https://www.parkalgo.com/logo.png",
          "description": "AI-powered parking optimization software company providing smart parking algorithms and automated solutions for cities, businesses, and parking operators.",
          "foundingDate": "2023",
          "industry": "Parking Technology",
          "numberOfEmployees": "10-50",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "US"
          },
          "sameAs": [
            "https://linkedin.com/company/parkalgo",
            "https://twitter.com/parkalgo"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "email": "support@parkalgo.com",
            "url": "https://www.parkalgo.com/contact"
          }
        }

      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Parkalgo",
          "url": "https://www.parkalgo.com",
          "description": "AI parking optimization software with smart algorithms for efficient parking management",
          "publisher": {
            "@type": "Organization",
            "name": "Parkalgo"
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.parkalgo.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }

      case 'article':
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data?.headline || "Article",
          "description": data?.description || "",
          "author": {
            "@type": "Person",
            "name": data?.author || "Parkalgo Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Parkalgo",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.parkalgo.com/logo.png"
            }
          },
          "datePublished": data?.datePublished || new Date().toISOString(),
          "dateModified": data?.dateModified || data?.datePublished || new Date().toISOString(),
          "image": data?.image || "https://www.parkalgo.com/default-article-image.jpg",
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": typeof window !== 'undefined' ? window.location.href : "https://www.parkalgo.com"
          },
          "keywords": data?.keywords || "",
          "articleSection": "Technology"
        }

      default:
        return data || {}
    }
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  )
}
