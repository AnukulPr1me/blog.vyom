'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ArticleEditorForm from '@/components/admin/ArticleEditorForm';
import type { Article } from '@/types';
import Cookies from 'js-cookie';

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = Cookies.get('vyom_token');
    fetch(`/api/articles/${id}?admin=true`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject('Not found'))
      .then(d => { setArticle(d); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, [id]);

  if (loading) return <div className="max-w-5xl mx-auto space-y-4">{Array(5).fill(0).map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}</div>;
  if (error || !article) return <div className="text-center py-16 text-gray-400"><p>Article not found.</p></div>;
  return <ArticleEditorForm article={article} />;
}
