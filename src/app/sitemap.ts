import { MetadataRoute } from 'next';
import { dbConnect } from '@/lib/db';
import { Article, Category, Author, Phone, PhoneCategory } from '@/lib/models';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vyom.quest').replace(/\/$/, '');
  try {
    await dbConnect();
    const [articles, categories, authors, phones, phoneCategories] = await Promise.all([
      Article.find({ status: 'published' }).select('slug updatedAt').sort({ updatedAt: -1 }).lean(),
      Category.find({ isActive: true }).select('slug updatedAt').lean(),
      Author.find({ isActive: true }).select('slug updatedAt').lean(),
      Phone.find({ isActive: true }).select('slug updatedAt').lean(),
      PhoneCategory.find({ isActive: true }).select('slug updatedAt').lean(),
    ]);

    const staticUrls: MetadataRoute.Sitemap = [
      { url: site, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
      { url: `${site}/about`, changeFrequency: 'monthly', priority: 0.6 },
      { url: `${site}/contact`, changeFrequency: 'monthly', priority: 0.5 },
      { url: `${site}/authors`, changeFrequency: 'weekly', priority: 0.6 },
      { url: `${site}/categories`, changeFrequency: 'weekly', priority: 0.7 },
      { url: `${site}/phones`, changeFrequency: 'weekly', priority: 0.7 },
      { url: `${site}/advertise`, changeFrequency: 'monthly', priority: 0.4 },
      { url: `${site}/privacy-policy`, changeFrequency: 'monthly', priority: 0.3 },
      { url: `${site}/terms`, changeFrequency: 'monthly', priority: 0.3 },
      { url: `${site}/disclaimer`, changeFrequency: 'monthly', priority: 0.3 },
      { url: `${site}/cookie-policy`, changeFrequency: 'monthly', priority: 0.3 },
      { url: `${site}/editorial-policy`, changeFrequency: 'monthly', priority: 0.3 },
    ];

    const categoryUrls: MetadataRoute.Sitemap = (categories as any[]).map(c => ({
      url: `${site}/category/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    const authorUrls: MetadataRoute.Sitemap = (authors as any[]).map(a => ({
      url: `${site}/author/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const articleUrls: MetadataRoute.Sitemap = (articles as any[]).map(a => ({
      url: `${site}/blog/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const phoneCategoryUrls: MetadataRoute.Sitemap = (phoneCategories as any[]).map(c => ({
      url: `${site}/phones/category/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const phoneUrls: MetadataRoute.Sitemap = (phones as any[]).map(p => ({
      url: `${site}/phones/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticUrls, ...categoryUrls, ...authorUrls, ...articleUrls, ...phoneCategoryUrls, ...phoneUrls];
  } catch {
    return [{ url: site, lastModified: new Date(), changeFrequency: 'daily', priority: 1 }];
  }
}
