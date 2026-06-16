'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import ArticleCard from './ArticleCard';
import { safeJson } from '@/lib/fetch-json';
import type { Article } from '@/types';

interface Props {
  initialArticles: Article[];
  initialPage: number;
  totalPages: number;
  pageSize: number;
}

export default function LatestArticlesGrid({ initialArticles, initialPage, totalPages, pageSize }: Props) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [page, setPage] = useState(initialPage);
  const [pages, setPages] = useState(totalPages);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/articles?page=${nextPage}&limit=${pageSize}&sort=-publishedAt`);
      const data = await safeJson<{ articles: Article[]; totalPages: number }>(res);
      if (res.ok && data) {
        setArticles(prev => [...prev, ...(data.articles || [])]);
        setPage(nextPage);
        setPages(data.totalPages || pages);
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setLoading(false);
    }
  };

  if (articles.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">No articles yet — check back soon!</p>
      </div>
    );
  }

  const hasMore = page < pages;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {articles.map((a, i) => <ArticleCard key={a._id} article={a} priority={i < 3} />)}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="btn-outline gap-2 px-8"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Loading…
              </>
            ) : (
              'Load More Articles'
            )}
          </button>
        </div>
      )}
    </>
  );
}
