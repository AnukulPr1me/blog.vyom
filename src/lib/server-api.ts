/**
 * Server-side data fetching — calls MongoDB directly via Mongoose models.
 * Used in Server Components (pages) to avoid HTTP round-trips.
 * Never import this in Client Components ('use client').
 */
import { cache } from 'react';
import mongoose from 'mongoose';
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

/**
 * Wrapped in React's `cache()` so generateMetadata() and the page component
 * — which both call this with the same slug during one request — share a
 * single DB query instead of issuing it twice (this was doubling article
 * page load time).
 *
 * Uses $lookup aggregation instead of .populate() — populate() issues
 * separate queries to the Category and Author collections (3 round-trips
 * total for one article). $lookup does it all in a single query.
 */
export const getArticleBySlug = cache(async (slug: string) => {
  await dbConnect();
  const results = await Article.aggregate([
    { $match: { slug, status: 'published' } },
    { $limit: 1 },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
        pipeline: [{ $project: { name: 1, slug: 1, description: 1 } }],
      },
    },
    {
      $lookup: {
        from: 'authors',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
        pipeline: [{ $project: { name: 1, avatar: 1, slug: 1, bio: 1, socialLinks: 1 } }],
      },
    },
    {
      $set: {
        category: { $arrayElemAt: ['$category', 0] },
        author: { $arrayElemAt: ['$author', 0] },
      },
    },
  ]);
  return results[0] || null;
});

/**
 * Fire-and-forget view counter — call once from the page body only
 * (not from generateMetadata). Does not block rendering.
 */
export function incrementViewCount(articleId: string) {
  dbConnect().then(() => {
    Article.findByIdAndUpdate(articleId, { $inc: { viewCount: 1 } }).exec();
  }).catch(() => {});
}

export async function getRelatedArticles(articleId: string, categoryId: string, limit = 3) {
  await dbConnect();
  return Article.aggregate([
    {
      $match: {
        _id: { $ne: new mongoose.Types.ObjectId(articleId) },
        category: new mongoose.Types.ObjectId(categoryId),
        status: 'published',
      },
    },
    { $sort: { publishedAt: -1 } },
    { $limit: limit },
    { $project: { content: 0, revisions: 0 } },
    {
      $lookup: {
        from: 'categories', localField: 'category', foreignField: '_id', as: 'category',
        pipeline: [{ $project: { name: 1, slug: 1 } }],
      },
    },
    {
      $lookup: {
        from: 'authors', localField: 'author', foreignField: '_id', as: 'author',
        pipeline: [{ $project: { name: 1, avatar: 1, slug: 1 } }],
      },
    },
    {
      $set: {
        category: { $arrayElemAt: ['$category', 0] },
        author: { $arrayElemAt: ['$author', 0] },
      },
    },
  ]);
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
  siteTagline: 'Tech News, Reviews, AI & Innovation',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://vyom.quest',
  siteEmail: 'hi.kio2002@gmail.com',
  metaDescription: 'Latest technology news, smartphone launches, laptop reviews, AI updates, cybersecurity insights, gadget trends, and innovation stories from around the world.',
  googleAnalyticsId: '',
  adsensePublisherId: '',
  socialLinks: { twitter: '', facebook: '', instagram: '', youtube: '' },
};

/**
 * Fetch site-wide settings from the database, merged with sensible defaults.
 * Used by the root layout for <title>, <meta description>, OpenGraph tags, etc.
 * Cached for 60s via Next.js `revalidate` on the calling page/layout.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
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
});

// ─── Advertisements ─────────────────────────────────────────────────────────
import { Ad } from './models';

/**
 * Fetches ALL active ads in a single query, cached per-request via
 * React.cache(). A typical page renders 2-4 AdBanner instances (header,
 * footer, sidebar, in-article) — without this, each one issued its own
 * DB round-trip (4 extra queries per page, a major source of latency).
 */
export const getAllActiveAds = cache(async () => {
  try {
    await dbConnect();
    return await Ad.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
  } catch (e) {
    console.error('getAllActiveAds error:', e);
    return [];
  }
});

export async function getAdsByPlacement(placement: string, limit = 1) {
  const all = await getAllActiveAds();
  return (all as any[]).filter(ad => ad.placement === placement).slice(0, limit);
}

export async function getFooterCategories() {
  try {
    await dbConnect();
    return await Category.find({ isActive: true, showInFooter: true })
      .sort({ order: 1, name: 1 })
      .limit(8)
      .select('name slug')
      .lean();
  } catch (e) {
    console.error('getFooterCategories error:', e);
    return [];
  }
}

/**
 * All published article slugs — used by generateStaticParams() so every
 * blog post is pre-rendered to static HTML at build time. Without this,
 * Next.js renders each article on-demand on its FIRST visit after a
 * deploy (or after the revalidate window expires), and that visitor
 * pays the full DB query cost — the 3-4s delay.
 */
export async function getAllArticleSlugs() {
  try {
    await dbConnect();
    const articles = await Article.find({ status: 'published' }).select('slug').lean();
    return (articles as any[]).map(a => ({ slug: a.slug }));
  } catch (e) {
    console.error('getAllArticleSlugs error:', e);
    return [];
  }
}

export async function getAllCategorySlugs() {
  try {
    await dbConnect();
    const cats = await Category.find({ isActive: true }).select('slug').lean();
    return (cats as any[]).map(c => ({ slug: c.slug }));
  } catch (e) {
    console.error('getAllCategorySlugs error:', e);
    return [];
  }
}

export async function getAllAuthorSlugs() {
  try {
    await dbConnect();
    const authors = await Author.find({ isActive: true }).select('slug').lean();
    return (authors as any[]).map(a => ({ slug: a.slug }));
  } catch (e) {
    console.error('getAllAuthorSlugs error:', e);
    return [];
  }
}
