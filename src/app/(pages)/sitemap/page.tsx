import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import { dbConnect } from '@/lib/db';
import { Article, Category } from '@/lib/models';

export const revalidate = 300;
export const metadata: Metadata = { title: 'Sitemap – Vyom' };

const staticPages = [
  { href: '/', label: 'Home' }, { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' }, { href: '/authors', label: 'Authors' },
  { href: '/categories', label: 'Categories' }, { href: '/search', label: 'Search' },
  { href: '/advertise', label: 'Advertise' }, { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' }, { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/editorial-policy', label: 'Editorial Policy' }, { href: '/cookie-policy', label: 'Cookie Policy' },
];

export default async function SitemapPage() {
  await dbConnect();
  const [categories, articles] = await Promise.all([
    Category.find({ isActive: true }).select('name slug').sort({ order: 1 }).lean(),
    Article.find({ status: 'published' }).select('title slug').sort({ publishedAt: -1 }).limit(100).lean(),
  ]);

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>Sitemap</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10">All pages on Vyom.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <section>
            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800" style={{ fontFamily: 'var(--font-syne)' }}>Pages</h2>
            <ul className="space-y-2">{staticPages.map(p => <li key={p.href}><Link href={p.href} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">{p.label}</Link></li>)}</ul>
          </section>
          <section>
            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800" style={{ fontFamily: 'var(--font-syne)' }}>Categories</h2>
            <ul className="space-y-2">{(categories as any[]).map(c => <li key={String(c._id)}><Link href={`/category/${c.slug}`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">{c.name}</Link></li>)}</ul>
          </section>
          <section>
            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800" style={{ fontFamily: 'var(--font-syne)' }}>Articles</h2>
            <ul className="space-y-2">{(articles as any[]).map(a => <li key={String(a._id)}><Link href={`/blog/${a.slug}`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline line-clamp-1">{a.title}</Link></li>)}</ul>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
