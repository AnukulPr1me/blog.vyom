import type { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, Zap, Grid3x3 } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import ArticleCard from '@/components/blog/ArticleCard';
import { getFeaturedArticles, getTrendingArticles, getPublishedArticles, getActiveCategories } from '@/lib/server-api';
import type { Article, Category } from '@/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Vyom – Your Tech Universe',
  description: 'Tech news, smartphone reviews, laptop guides, and AI insights.',
};

export default async function HomePage() {
  let featured: any[] = [], latest: any[] = [], trending: any[] = [], categories: any[] = [];
  try {
    [featured, { articles: latest }, trending, categories] = await Promise.all([
      getFeaturedArticles(3),
      getPublishedArticles({ limit: 9, sort: '-publishedAt' }),
      getTrendingArticles(5),
      getActiveCategories(),
    ]);
  } catch (e) {
    console.error('Homepage data error:', e);
  }

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {featured.length > 0 && (
          <section className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {featured[0] && <div className="lg:col-span-2"><ArticleCard article={featured[0] as Article} variant="featured" /></div>}
              <div className="flex flex-col gap-4">
                {featured.slice(1, 3).map((a: any) => <ArticleCard key={a._id} article={a as Article} variant="featured" />)}
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
            {latest.length === 0
              ? <div className="text-center py-16 text-gray-400"><p className="text-lg">No articles yet — check back soon!</p></div>
              : <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{latest.map((a: any) => <ArticleCard key={a._id} article={a as Article} />)}</div>
            }
          </div>

          <aside className="space-y-6">
            {trending.length > 0 && (
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4 text-base" style={{ fontFamily: 'var(--font-syne)' }}>
                  <TrendingUp size={16} className="text-orange-500" />Trending
                </h3>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {trending.map((a: any, i: number) => (
                    <Link key={a._id} href={`/blog/${a.slug}`} className="flex gap-3 py-3 group first:pt-0 last:pb-0">
                      <span className="text-2xl font-black text-gray-200 dark:text-gray-700 w-8 flex-shrink-0 leading-none pt-0.5" style={{ fontFamily: 'var(--font-syne)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        {a.category && <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase">{a.category.name}</span>}
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
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
