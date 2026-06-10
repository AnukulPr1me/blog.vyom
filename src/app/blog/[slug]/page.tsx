import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatDateLong, readingTimeLabel, absoluteUrl, shareUrl } from '@/lib/utils';
import PublicLayout from '@/components/layout/PublicLayout';
import ArticleCard from '@/components/blog/ArticleCard';
import ShareButtons from '@/components/blog/ShareButtons';
import Breadcrumb from '@/components/blog/Breadcrumb';
import type { Article } from '@/types';

type Props = { params: { slug: string } };

const BASE = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api`
  : 'http://localhost:3000/api';

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${BASE}/articles/${slug}?view=true`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function getRelated(id: string, categoryId: string): Promise<Article[]> {
  try {
    const res = await fetch(`${BASE}/articles?category=${categoryId}&limit=4`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles || []).filter((a: Article) => a._id !== id).slice(0, 3);
  } catch { return []; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: 'Not Found' };
  const url = absoluteUrl(`/blog/${article.slug}`);
  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    keywords: article.seoKeywords?.join(', '),
    authors: article.author ? [{ name: article.author.name }] : [],
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      url, type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: article.featuredImage ? [{ url: article.featuredImage, width: 1200, height: 630, alt: article.title }] : [],
      authors: article.author ? [article.author.name] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      images: article.featuredImage ? [article.featuredImage] : [],
    },
    alternates: { canonical: article.canonicalUrl || url },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  const related = article.category
    ? await getRelated(article._id, (article.category as any)._id || article.category)
    : [];

  const url = absoluteUrl(`/blog/${article.slug}`);

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.featuredImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: article.author ? {
      '@type': 'Person',
      name: article.author.name,
      url: absoluteUrl(`/author/${article.author.slug}`),
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Vyom',
      url: absoluteUrl('/'),
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Article */}
          <article className="lg:col-span-3">
            <Breadcrumb items={[
              { label: 'Home', href: '/' },
              ...(article.category ? [{ label: article.category.name, href: `/category/${article.category.slug}` }] : []),
              { label: article.title },
            ]} />

            <header className="mt-4 mb-8">
              {article.category && (
                <Link href={`/category/${article.category.slug}`} className="badge-blue mb-3 inline-block">
                  {article.category.name}
                </Link>
              )}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-50 leading-tight mb-4" style={{ fontFamily: 'var(--font-syne)' }}>
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed border-l-4 border-brand-500 pl-4">
                  {article.excerpt}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-5 text-sm text-gray-500 dark:text-gray-400">
                {article.author && (
                  <Link href={`/author/${article.author.slug}`} className="flex items-center gap-2 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    {article.author.avatar
                      ? <Image src={article.author.avatar} alt={article.author.name} width={32} height={32} className="rounded-full ring-2 ring-brand-100 dark:ring-brand-900" />
                      : <span className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 font-bold">{article.author.name[0]}</span>
                    }
                    <span className="font-medium">{article.author.name}</span>
                  </Link>
                )}
                {article.publishedAt && <span>{formatDateLong(article.publishedAt)}</span>}
                <span className="flex items-center gap-1">📖 {readingTimeLabel(article.readingTime)}</span>
                <span className="flex items-center gap-1">👁 {article.viewCount.toLocaleString()} views</span>
              </div>
            </header>

            {article.featuredImage && (
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 bg-gray-100 dark:bg-gray-800">
                <Image src={article.featuredImage} alt={article.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 75vw" priority />
              </div>
            )}

            {/* Content */}
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-1">Tags:</span>
                {article.tags.map(tag => (
                  <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 rounded-full hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <ShareButtons url={url} title={article.title} />

            {/* Author card */}
            {article.author && (
              <div className="card p-6 mt-8 flex gap-4">
                {article.author.avatar
                  ? <Image src={article.author.avatar} alt={article.author.name} width={64} height={64} className="rounded-full flex-shrink-0" />
                  : <span className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 font-bold text-xl flex-shrink-0">{article.author.name[0]}</span>
                }
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Written by</p>
                  <Link href={`/author/${article.author.slug}`} className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors" style={{ fontFamily: 'var(--font-syne)' }}>
                    {article.author.name}
                  </Link>
                  {article.author.bio && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{article.author.bio}</p>}
                  {article.author.socialLinks && (
                    <div className="flex gap-3 mt-2 text-xs">
                      {article.author.socialLinks.twitter && <a href={article.author.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline">Twitter</a>}
                      {article.author.socialLinks.linkedin && <a href={article.author.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline">LinkedIn</a>}
                      {article.author.socialLinks.website && <a href={article.author.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline">Website</a>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Related */}
            {related.length > 0 && (
              <section className="mt-10">
                <h2 className="section-title mb-5">Related Articles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {related.map(a => <ArticleCard key={a._id} article={a} />)}
                </div>
              </section>
            )}
          </article>

          {/* Sidebar sticky */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-3" style={{ fontFamily: 'var(--font-syne)' }}>Share this article</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['twitter','facebook','linkedin','whatsapp'].map(p => (
                    <a key={p} href={shareUrl(p, url, article.title)} target="_blank" rel="noopener noreferrer"
                      className="px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg text-center capitalize transition-colors">
                      {p}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
