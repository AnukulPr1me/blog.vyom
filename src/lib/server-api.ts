/**
 * Server-side data fetching — calls MongoDB directly via Mongoose models.
 * Used in Server Components (pages) to avoid HTTP round-trips.
 * Never import this in Client Components ('use client').
 */
import { dbConnect } from './db';
import { Article, Category, Author } from './models';

export async function getPublishedArticles(opts: {
  page?: number; limit?: number; categoryId?: string; search?: string; sort?: string;
} = {}) {
  await dbConnect();
  const { page = 1, limit = 10, categoryId, search, sort = '-publishedAt' } = opts;
  const filter: any = { status: 'published' };
  if (categoryId) filter.category = categoryId;
  if (search) filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { excerpt: { $regex: search, $options: 'i' } },
  ];
  const skip = (page - 1) * limit;
  const [articles, total] = await Promise.all([
    Article.find(filter).populate('category', 'name slug').populate('author', 'name avatar slug')
      .sort(sort).skip(skip).limit(limit).select('-content -revisions').lean(),
    Article.countDocuments(filter),
  ]);
  return { articles, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getFeaturedArticles(limit = 3) {
  await dbConnect();
  return Article.find({ status: 'published' })
    .populate('category', 'name slug').populate('author', 'name avatar slug')
    .sort({ publishedAt: -1 }).limit(limit).select('-content -revisions').lean();
}

export async function getTrendingArticles(limit = 5) {
  await dbConnect();
  return Article.find({ status: 'published' })
    .populate('category', 'name slug').populate('author', 'name avatar slug')
    .sort({ viewCount: -1, publishedAt: -1 }).limit(limit).select('-content -revisions').lean();
}

export async function getArticleBySlug(slug: string, incrementView = false) {
  await dbConnect();
  const article = await Article.findOne({ slug, status: 'published' })
    .populate('category', 'name slug description')
    .populate('author', 'name avatar slug bio socialLinks')
    .lean();
  if (!article) return null;
  if (incrementView) {
    // Fire-and-forget
    Article.findByIdAndUpdate((article as any)._id, { $inc: { viewCount: 1 } }).exec();
  }
  return article;
}

export async function getRelatedArticles(articleId: string, categoryId: string, limit = 3) {
  await dbConnect();
  return Article.find({ _id: { $ne: articleId }, category: categoryId, status: 'published' })
    .populate('category', 'name slug').populate('author', 'name avatar slug')
    .sort({ publishedAt: -1 }).limit(limit).select('-content -revisions').lean();
}

export async function getCategoryBySlug(slug: string) {
  await dbConnect();
  return Category.findOne({ slug, isActive: true }).lean();
}

export async function getActiveCategories() {
  await dbConnect();
  return Category.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
}

export async function getAuthorBySlug(slug: string) {
  await dbConnect();
  return Author.findOne({ slug }).lean();
}

export async function getArticlesByAuthor(authorId: string) {
  await dbConnect();
  return Article.find({ author: authorId, status: 'published' })
    .populate('category', 'name slug').sort({ publishedAt: -1 })
    .select('-content -revisions').lean();
}

// ─── Site Settings ──────────────────────────────────────────────────────────
import { Setting } from './models';

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  siteUrl: string;
  siteEmail: string;
  metaDescription: string;
  googleAnalyticsId: string;
  adsensePublisherId: string;
  socialLinks: {
    twitter: string;
    facebook: string;
    instagram: string;
    youtube: string;
  };
}

const SITE_SETTINGS_DEFAULTS: SiteSettings = {
  siteName: 'Vyom',
  siteTagline: 'Your Tech Universe',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://vyom.quest',
  siteEmail: 'hi.kio2002@gmail.com',
  metaDescription: 'Vyom is your go-to source for tech news, smartphone reviews, laptop guides, and AI insights.',
  googleAnalyticsId: '',
  adsensePublisherId: '',
  socialLinks: { twitter: '', facebook: '', instagram: '', youtube: '' },
};

/**
 * Fetch site-wide settings from the database, merged with sensible defaults.
 * Used by the root layout for <title>, <meta description>, OpenGraph tags, etc.
 * Cached for 60s via Next.js `revalidate` on the calling page/layout.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    await dbConnect();
    const docs = await Setting.find().lean();
    const obj: Record<string, any> = {};
    docs.forEach((d: any) => { obj[d.key] = d.value; });

    return {
      siteName:           obj.siteName           || SITE_SETTINGS_DEFAULTS.siteName,
      siteTagline:        obj.siteTagline        || SITE_SETTINGS_DEFAULTS.siteTagline,
      siteUrl:            obj.siteUrl            || SITE_SETTINGS_DEFAULTS.siteUrl,
      siteEmail:          obj.siteEmail          || SITE_SETTINGS_DEFAULTS.siteEmail,
      metaDescription:    obj.metaDescription    || SITE_SETTINGS_DEFAULTS.metaDescription,
      googleAnalyticsId:  obj.googleAnalyticsId  || SITE_SETTINGS_DEFAULTS.googleAnalyticsId,
      adsensePublisherId: obj.adsensePublisherId || SITE_SETTINGS_DEFAULTS.adsensePublisherId,
      socialLinks: {
        twitter:   obj.socialLinks?.twitter   || '',
        facebook:  obj.socialLinks?.facebook  || '',
        instagram: obj.socialLinks?.instagram || '',
        youtube:   obj.socialLinks?.youtube   || '',
      },
    };
  } catch (e) {
    console.error('getSiteSettings error:', e);
    return SITE_SETTINGS_DEFAULTS;
  }
}

// ─── Advertisements ─────────────────────────────────────────────────────────
import { Ad } from './models';

export async function getAdsByPlacement(placement: string, limit = 1) {
  try {
    await dbConnect();
    return await Ad.find({ placement, isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(limit)
      .lean();
  } catch (e) {
    console.error('getAdsByPlacement error:', e);
    return [];
  }
}
