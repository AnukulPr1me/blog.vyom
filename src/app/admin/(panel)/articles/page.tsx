'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Pencil, Trash2, Eye, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import type { Article } from '@/types';
import Cookies from 'js-cookie';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const token = Cookies.get('vyom_token');
    setLoading(true);
    const p = new URLSearchParams({ admin: 'true', page: String(page), limit: '15', sort: '-createdAt' });
    if (search) p.set('search', search);
    if (statusFilter) p.set('status', statusFilter);
    fetch(`/api/articles?${p}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setArticles(d.articles || []); setTotal(d.total || 0); setTotalPages(d.totalPages || 1); setLoading(false); })
      .catch(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const deleteArticle = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const token = Cookies.get('vyom_token');
    try {
      await fetch(`/api/articles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      toast.success('Deleted'); load();
    } catch { toast.error('Failed to delete'); }
  };

  const toggleStatus = async (a: Article) => {
    const token = Cookies.get('vyom_token');
    const newStatus = a.status === 'published' ? 'draft' : 'published';
    try {
      await fetch(`/api/articles/${a._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: newStatus }) });
      toast.success(`Moved to ${newStatus}`); load();
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>Articles</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} total</p>
        </div>
        <Link href="/admin/articles/new" className="btn-primary gap-2"><Plus size={16} />New Article</Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search…" className="input pl-9 text-sm" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input sm:w-40 text-sm">
          <option value="">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array(6).fill(0).map((_, i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
        ) : articles.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <p>No articles found. <Link href="/admin/articles/new" className="text-indigo-600 dark:text-indigo-400 hover:underline">Create one →</Link></p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Views</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {articles.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{a.title}</p>
                      <p className="text-xs text-gray-400 font-mono line-clamp-1">{a.slug}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 dark:text-gray-400 text-xs">{a.category?.name || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs whitespace-nowrap">{formatDate(a.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(a)} title="Click to toggle"
                        className={`badge cursor-pointer hover:opacity-80 ${a.status === 'published' ? 'badge-green' : a.status === 'scheduled' ? 'badge-yellow' : 'badge-gray'}`}>
                        {a.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-400 text-xs">
                      <span className="flex items-center gap-1"><Eye size={10} />{a.viewCount}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {a.status === 'published' && (
                          <a href={`/blog/${a.slug}`} target="_blank" rel="noopener noreferrer" title="View live"
                            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <Link href={`/admin/articles/${a._id}`} title="Edit"
                          className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => deleteArticle(a._id, a.title)} title="Delete"
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
