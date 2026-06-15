import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Smartphone } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import PhoneCard from '@/components/phones/PhoneCard';
import AdBanner from '@/components/common/AdBanner';
import { getActivePhoneCategories, getFeaturedPhones, getSiteSettings } from '@/lib/server-api';
import { getPhoneCategoryIcon } from '@/lib/phone-icons';
import type { Phone } from '@/types';

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Phone Finder | ${settings.siteName}`,
    description: 'Browse phones by budget, mid-range, flagship, camera, and gaming categories — with full specs and prices.',
  };
}

export default async function PhonesPage() {
  const [categories, featured] = await Promise.all([
    getActivePhoneCategories(),
    getFeaturedPhones(8),
  ]);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3" style={{ fontFamily: 'var(--font-syne)' }}>
            <Smartphone className="text-indigo-500" size={32} />
            Phone Finder
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Find the right phone by category — with full specs, pricing, and pros &amp; cons.
          </p>
        </div>

        {/* Category tabs */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-10">
            {(categories as any[]).map(cat => {
              const Icon = getPhoneCategoryIcon(cat.icon);
              return (
                <Link
                  key={String(cat._id)}
                  href={`/phones/category/${cat.slug}`}
                  className="group flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  <Icon size={18} className="text-indigo-500" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </span>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })}
          </div>
        )}

        <AdBanner placement="homepage-banner" className="mb-10" />

        {/* Featured phones */}
        {featured.length > 0 ? (
          <section>
            <h2 className="section-title mb-5">Featured Phones</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {(featured as any[]).map(p => <PhoneCard key={String(p._id)} phone={p as Phone} />)}
            </div>
          </section>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Smartphone size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg">Phone categories coming soon!</p>
          </div>
        ) : null}
      </div>
    </PublicLayout>
  );
}
