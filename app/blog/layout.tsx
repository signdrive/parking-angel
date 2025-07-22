import { Metadata } from 'next'
import { seoConfigs } from '@/components/seo/seo-metadata'

export const metadata: Metadata = seoConfigs.blog

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
