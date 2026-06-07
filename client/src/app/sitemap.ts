import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobistore.vercel.app';

  const staticPages = [
    '', '/products', '/categories', '/brands', '/offers', '/about', '/contact',
    '/faq', '/privacy', '/terms', '/refund', '/track-order',
  ];

  return staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));
}
