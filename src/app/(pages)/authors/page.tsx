import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import { getActiveCategories } from '@/lib/server-api';
import { dbConnect } from '@/lib/db';
import { Author } from '@/lib/models';
import type { Author as IAuthor } from '@/types';

export const revalidate = 600;
export const metadata: Metadata = { title: 'Authors – Vyom', description: 'Meet the writers behind Vyom.' };

export default async function AuthorsPage() {
  await dbConnect();
  const authors = await Author.find({ isActive: true }).sort({ name: 1 }).lean() as any[];

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'var(--font-syne)' }}>Our Authors</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10">Meet the people behind Vyom&apos;s content.</p>
        {authors.length === 0
          ? <div className="text-center py-16 text-gray-400"><p>No authors yet.</p></div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {authors.map((a: any) => (
                <Link key={a._id} href={`/author/${a.slug}`} className="card p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex gap-4">
                  {a.avatar
                    ? <Image src={a.avatar} alt={a.name} width={64} height={64} className="rounded-full flex-shrink-0" />
                    : <span className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 font-bold text-xl flex-shrink-0">{a.name[0]}</span>
                  }
                  <div className="min-w-0">
                    <h2 className="font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>{a.name}</h2>
                    {a.bio && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{a.bio}</p>}
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 inline-block">View articles →</span>
                  </div>
                </Link>
              ))}
            </div>
        }
      </div>
    </PublicLayout>
  );
}
