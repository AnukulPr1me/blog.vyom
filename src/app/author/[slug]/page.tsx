import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Twitter, Linkedin, Github, Globe } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import ArticleCard from '@/components/blog/ArticleCard';
import Breadcrumb from '@/components/blog/Breadcrumb';
import { getAuthorBySlug, getArticlesByAuthor, getAllAuthorSlugs } from '@/lib/server-api';
import type { Article } from '@/types';

export const revalidate = 120;
type Props = { params: { slug: string } };

export async function generateStaticParams() {
  return getAllAuthorSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const author = await getAuthorBySlug(params.slug) as any;
  if (!author) return { title: 'Not Found' };
  return { title: `${author.name} – Author at Vyom`, description: author.bio || `Articles by ${author.name}` };
}

export default async function AuthorPage({ params }: Props) {
  const author = await getAuthorBySlug(params.slug) as any;
  if (!author) notFound();
  const articles = await getArticlesByAuthor(String(author._id));

  const socials = [
    { key: 'twitter', icon: Twitter }, { key: 'linkedin', icon: Linkedin },
    { key: 'github', icon: Github }, { key: 'website', icon: Globe },
  ];

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Authors', href: '/authors' }, { label: author.name }]} />
        <div className="card p-6 sm:p-8 mt-6 mb-10 flex flex-col sm:flex-row gap-6 items-start">
          {author.avatar
            ? <Image src={author.avatar} alt={author.name} width={96} height={96} className="rounded-full flex-shrink-0 ring-4 ring-indigo-100 dark:ring-indigo-900" />
            : <span className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 font-bold text-3xl flex-shrink-0">{author.name[0]}</span>
          }
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>{author.name}</h1>
            {author.bio && <p className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{author.bio}</p>}
            <div className="flex gap-2 mt-3">
              {socials.map(({ key, icon: Icon }) => author.socialLinks?.[key] && (
                <a key={key} href={author.socialLinks[key]} target="_blank" rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 rounded-lg transition-colors text-gray-500">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400" style={{ fontFamily: 'var(--font-syne)' }}>{articles.length}</p>
            <p className="text-sm text-gray-400">Articles</p>
          </div>
        </div>

        <h2 className="section-title mb-6">Articles by {author.name}</h2>
        {articles.length === 0
          ? <div className="text-center py-12 text-gray-400"><p>No articles yet.</p></div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(articles as any[]).map(a => <ArticleCard key={a._id} article={a as Article} />)}
            </div>
        }
      </div>
    </PublicLayout>
  );
}
