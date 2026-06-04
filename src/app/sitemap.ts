import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://enwari.enjirou.com',
      lastModified: new Date(),
      priority: 1,
    },
  ]
}