import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://parkalgo.com/sitemap.xml',
      lastModified: new Date(),
    },
    {
      url: 'https://parkalgo.com/blog/sitemap.xml',
      lastModified: new Date(),
    },
  ]
}
