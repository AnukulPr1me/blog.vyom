import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Star, ExternalLink } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import PhoneGallery from '@/components/phones/PhoneGallery';
import PhoneCard from '@/components/phones/PhoneCard';
import Breadcrumb from '@/components/blog/Breadcrumb';
import AdBanner from '@/components/common/AdBanner';
import { getPhoneBySlug, getRelatedPhones, getAllPhoneSlugs, getSiteSettings } from '@/lib/server-api';
import type { Phone } from '@/types';

export const revalidate = 120;
type Props = { params: { slug: string } };

export async function generateStaticParams() {
  return getAllPhoneSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const phone = await getPhoneBySlug(params.slug) as any;
  if (!phone) return { title: 'Not Found' };
  const settings = await getSiteSettings();
  const title = `${phone.brand} ${phone.name} — Price, Specs & Review | ${settings.siteName}`;
  const description = phone.description
    ? phone.description.replace(/<[^>]*>/g, '').slice(0, 160)
    : `${phone.brand} ${phone.name} price, full specifications, and review.`;

  return {
    title,
    description,
    openGraph: {
      title, description,
      images: phone.images?.[0] ? [{ url: phone.images[0] }] : [],
      type: 'website',
    },
  };
}

const SPEC_LABELS: Record<string, string> = {
  display: 'Display',
  processor: 'Processor',
  ram: 'RAM',
  storage: 'Storage',
  battery: 'Battery',
  charging: 'Charging',
  rearCamera: 'Rear Camera',
  frontCamera: 'Front Camera',
  os: 'Operating System',
  network: 'Network',
  dimensions: 'Dimensions',
  weight: 'Weight',
  colors: 'Colors',
};

export default async function PhoneDetailPage({ params }: Props) {
  const phone = await getPhoneBySlug(params.slug) as any;
  if (!phone) notFound();

  const specEntries = Object.entries(phone.specs || {}).filter(([, v]) => v);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${phone.brand} ${phone.name}`,
    image: phone.images,
    description: phone.description?.replace(/<[^>]*>/g, '').slice(0, 300),
    brand: { '@type': 'Brand', name: phone.brand },
    offers: {
      '@type': 'Offer',
      price: phone.price,
      priceCurrency: phone.currency === '₹' ? 'INR' : 'USD',
      availability: 'https://schema.org/InStock',
    },
    ...(phone.rating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: phone.rating, bestRating: 5, ratingCount: 1 } } : {}),
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Phone Finder', href: '/phones' },
          ...(phone.category ? [{ label: phone.category.name, href: `/phones/category/${phone.category.slug}` }] : []),
          { label: `${phone.brand} ${phone.name}` },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-4">
          {/* Gallery */}
          <div>
            <PhoneGallery images={phone.images || []} name={`${phone.brand} ${phone.name}`} />
          </div>

          {/* Info */}
          <div>
            {phone.category && (
              <Link href={`/phones/category/${phone.category.slug}`} className="badge-blue mb-3 inline-block">
                {phone.category.name}
              </Link>
            )}
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{phone.brand}</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mt-1" style={{ fontFamily: 'var(--font-syne)' }}>
              {phone.name}
            </h1>

            <div className="flex items-center gap-4 mt-4">
              <span className="text-3xl font-black text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>
                {phone.currency}{phone.price.toLocaleString()}
              </span>
              {phone.rating != null && (
                <span className="flex items-center gap-1.5 text-base font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                  <Star size={15} className="text-yellow-400 fill-yellow-400" />
                  {phone.rating} / 5
                </span>
              )}
            </div>

            {phone.buyLink && (
              <a href={phone.buyLink} target="_blank" rel="noopener noreferrer sponsored"
                className="btn-primary mt-5 gap-2 inline-flex">
                Check Price <ExternalLink size={14} />
              </a>
            )}

            {/* Quick specs preview */}
            {specEntries.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-6">
                {specEntries.slice(0, 4).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-xs text-gray-400">{SPEC_LABELS[key] || key}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{value as string}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Pros & Cons */}
            {(phone.pros?.length > 0 || phone.cons?.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {phone.pros?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-green-600 dark:text-green-400 mb-2">Pros</h3>
                    <ul className="space-y-1.5">
                      {phone.pros.map((p: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {phone.cons?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-red-500 mb-2">Cons</h3>
                    <ul className="space-y-1.5">
                      {phone.cons.map((c: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Suspense fallback={null}>
          <AdBanner placement="in-article" className="my-10" />
        </Suspense>

        {/* Description */}
        {phone.description && (
          <section className="mt-10 max-w-3xl">
            <h2 className="section-title mb-4">Overview</h2>
            <div className="article-body" dangerouslySetInnerHTML={{ __html: phone.description }} />
          </section>
        )}

        {/* Full specs table */}
        {specEntries.length > 0 && (
          <section className="mt-10">
            <h2 className="section-title mb-4">Full Specifications</h2>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {specEntries.map(([key, value]) => (
                    <tr key={key}>
                      <td className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-1/3">{SPEC_LABELS[key] || key}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{value as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Related phones */}
        {phone.category && (
          <Suspense fallback={null}>
            <RelatedPhones phoneId={String(phone._id)} categoryId={String(phone.category._id || phone.category)} />
          </Suspense>
        )}
      </div>
    </PublicLayout>
  );
}

async function RelatedPhones({ phoneId, categoryId }: { phoneId: string; categoryId: string }) {
  const related = await getRelatedPhones(phoneId, categoryId);
  if (!related || related.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="section-title mb-5">Similar Phones</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {(related as any[]).map(p => <PhoneCard key={String(p._id)} phone={p as Phone} />)}
      </div>
    </section>
  );
}
