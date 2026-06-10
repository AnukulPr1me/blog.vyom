import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import { getActiveCategories } from '@/lib/server-api';
import type { Category } from '@/types';

export const revalidate = 600;
export const metadata: Metadata = { title: 'Categories – Vyom', description: 'Browse all tech topics on Vyom.' };

const colors = [
  'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800',
  'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800',
  'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800',
  'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800',
  'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border border-pink-100 dark:border-pink-800',
  'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800',
];

export default async function CategoriesPage() {
  const categories = await getActiveCategories() as any[];
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'var(--font-syne)' }}>Browse Categories</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10">Find articles on every tech topic.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat: any, i: number) => (
            <Link key={cat._id} href={`/category/${cat.slug}`}
              className={`p-5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${colors[i % colors.length]}`}>
              <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-syne)' }}>{cat.name}</h2>
              {cat.description && <p className="text-xs mt-1 opacity-70 line-clamp-2">{cat.description}</p>}
              <span className="text-xs font-medium mt-3 inline-block opacity-80">Browse →</span>
            </Link>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
