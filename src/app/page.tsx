import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, Zap, Grid3x3, Smartphone, Laptop as LaptopIcon, PenTool, Camera as CameraIcon } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import ArticleCard from '@/components/blog/ArticleCard';
import { getFeaturedArticles, getTrendingArticles, getPublishedArticles, getActiveCategories, getSiteSettings } from '@/lib/server-api';
import type { Article, Category } from '@/types';
import AdBanner from '@/components/common/AdBanner';
import LatestArticlesGrid from '@/components/blog/LatestArticlesGrid';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `${settings.siteName} – ${settings.siteTagline}`,
    description: settings.metaDescription,
  };
}

export default async function HomePage() {
  const PAGE_SIZE = 9;
  let featured: any[] = [], latest: any[] = [], totalPages = 1, trending: any[] = [], categories: any[] = [];
  try {
    let latestResult;
    [featured, latestResult, trending, categories] = await Promise.all([
      getFeaturedArticles(3),
      getPublishedArticles({ limit: PAGE_SIZE, sort: '-publishedAt' }),
      getTrendingArticles(5),
      getActiveCategories(),
    ]);
    latest = latestResult.articles;
    totalPages = latestResult.totalPages;
  } catch (e) {
    console.error('Homepage data error:', e);
  }

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Suspense fallback={null}>
          <AdBanner placement="homepage-banner" className="mb-8" />
        </Suspense>

        {featured.length > 0 && (
          <section className="mb-12" aria-label="Featured articles">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-stretch">
              {/* Hero card — 2/3 width, full height of the row */}
              {featured[0] && (
                <div className="lg:col-span-2 lg:h-full">
                  <ArticleCard article={featured[0] as Article} variant="featured" className="aspect-[16/10] sm:aspect-video lg:aspect-auto lg:h-full" priority />
                </div>
              )}
              {/* Side cards — each exactly half the hero height via flex */}
              <div className="flex flex-col gap-4">
                {featured.slice(1, 3).map((a: any) => (
                  <div key={a._id} className="flex-1">
                    <ArticleCard article={a as Article} variant="featured" className="h-full" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title flex items-center gap-2"><Zap size={20} className="text-indigo-500" />Latest Articles</h2>
              <Link href="/search" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">View all →</Link>
            </div>
            <LatestArticlesGrid
              initialArticles={latest as Article[]}
              initialPage={1}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
            />
          </div>

          <aside className="space-y-6" aria-label="Sidebar">
            {trending.length > 0 && (
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4 text-base" style={{ fontFamily: 'var(--font-syne)' }}>
                  <TrendingUp size={16} className="text-orange-500" />Trending
                </h3>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {trending.map((a: any, i: number) => (
                    <Link key={a._id} href={`/blog/${a.slug}`} className="flex items-start gap-4 py-3 group first:pt-0 last:pb-0">
                      <span className="text-2xl font-black text-gray-200 dark:text-gray-700 w-10 flex-shrink-0 leading-none pt-0.5 tabular-nums" style={{ fontFamily: 'var(--font-syne)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        {a.category && (
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wide">
                            {a.category.name}
                          </span>
                        )}
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-0.5" style={{ fontFamily: 'var(--font-syne)' }}>
                          {a.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {categories.length > 0 && (
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4 text-base" style={{ fontFamily: 'var(--font-syne)' }}>
                  <Grid3x3 size={16} className="text-indigo-500" />Browse Topics
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {(categories as Category[]).slice(0, 8).map(cat => (
                    <Link key={cat._id} href={`/category/${cat.slug}`}
                      className="px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors text-center">
                      {cat.name}
                    </Link>
                  ))}
                </div>
                <Link href="/categories" className="block mt-3 text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline">All categories →</Link>
              </div>
            )}

            <div className="card p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4 text-base" style={{ fontFamily: 'var(--font-syne)' }}>
                <Smartphone size={16} className="text-indigo-500" />Browse Devices
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/phones" className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors">
                  <Smartphone size={14} className="text-indigo-400 flex-shrink-0" /><span className="truncate">Phones</span>
                </Link>
                <Link href="/laptops" className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors">
                  <LaptopIcon size={14} className="text-indigo-400 flex-shrink-0" /><span className="truncate">Laptops</span>
                </Link>
                <Link href="/tablets" className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors">
                  <PenTool size={14} className="text-indigo-400 flex-shrink-0" /><span className="truncate">Drawing Tablets</span>
                </Link>
                <Link href="/cameras" className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors">
                  <CameraIcon size={14} className="text-indigo-400 flex-shrink-0" /><span className="truncate">Cameras</span>
                </Link>
              </div>
            </div>

            <Suspense fallback={null}>
              <AdBanner placement="sidebar" />
            </Suspense>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
