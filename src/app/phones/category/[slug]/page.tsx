import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import PhoneCard from '@/components/phones/PhoneCard';
import Breadcrumb from '@/components/blog/Breadcrumb';
import AdBanner from '@/components/common/AdBanner';
import { getPhoneCategoryBySlug, getPhonesByCategory, getAllPhoneCategorySlugs, getSiteSettings } from '@/lib/server-api';
import { getPhoneCategoryIcon } from '@/lib/phone-icons';
import type { Phone } from '@/types';

export const revalidate = 60;
type Props = { params: { slug: string }; searchParams: { page?: string } };

export async function generateStaticParams() {
  return getAllPhoneCategorySlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await getPhoneCategoryBySlug(params.slug) as any;
  if (!cat) return { title: 'Not Found' };
  const settings = await getSiteSettings();
  return {
    title: `${cat.name} Phones | ${settings.siteName}`,
    description: cat.description || `Browse ${cat.name} phones with full specs and prices.`,
  };
}

export default async function PhoneCategoryPage({ params, searchParams }: Props) {
  const cat = await getPhoneCategoryBySlug(params.slug) as any;
  if (!cat) notFound();

  const page = Number(searchParams.page || 1);
  const { phones, total, totalPages } = await getPhonesByCategory(String(cat._id), { page, limit: 12 });
  const Icon = getPhoneCategoryIcon(cat.icon);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Phone Finder', href: '/phones' }, { label: cat.name }]} />

        <div className="mt-4 mb-8">
          <span className="badge-blue text-sm mb-2 inline-block">{total} phone{total === 1 ? '' : 's'}</span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3" style={{ fontFamily: 'var(--font-syne)' }}>
            <Icon className="text-indigo-500" size={28} />
            {cat.name} Phones
          </h1>
          {cat.description && <p className="text-gray-500 dark:text-gray-400 mt-2">{cat.description}</p>}
        </div>

        <AdBanner placement="header" className="mb-8" />

        {phones.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No phones in this category yet.</p>
            <Link href="/phones" className="text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">← Back to Phone Finder</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {(phones as any[]).map(p => <PhoneCard key={String(p._id)} phone={p as Phone} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <a key={p} href={`?page=${p}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
