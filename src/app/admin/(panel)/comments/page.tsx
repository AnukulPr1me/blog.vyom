'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Trash2, CheckCircle, AlertTriangle, MessageCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { safeJson } from '@/lib/fetch-json';
import { formatRelative } from '@/lib/utils';
import Cookies from 'js-cookie';

interface Comment {
  _id: string;
  name: string;
  email: string;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  parent: string | null;
  createdAt: string;
  article: { _id: string; title: string; slug: string } | null;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const headers = useCallback(() => {
    const token = Cookies.get('vyom_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ admin: 'true' });
      if (statusFilter) p.set('status', statusFilter);
      const res = await fetch(`/api/comments?${p}`, { headers: headers() });
      const data = await safeJson<{ comments: Comment[]; total: number }>(res);
      if (res.ok && data) { setComments(data.comments || []); setTotal(data.total || 0); }
    } catch { toast.error('Failed to load comments'); }
    finally { setLoading(false); }
  }, [statusFilter, headers]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: string, status: Comment['status']) => {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PATCH', headers: headers(), body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Marked as ${status}`);
      load();
    } catch { toast.error('Failed to update'); }
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete comment by "${name}"? This also removes any replies.`)) return;
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE', headers: headers() });
      if (!res.ok) throw new Error('Failed');
      toast.success('Comment deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const statusBadge = (s: Comment['status']) => {
    if (s === 'approved') return <span className="badge badge-green">Approved</span>;
    if (s === 'spam')     return <span className="badge badge-gray">Spam</span>;
    return <span className="badge badge-yellow">Pending</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>Comments</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} total</p>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input sm:w-40 text-sm">
          <option value="">All statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="spam">Spam</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
        ) : comments.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <MessageCircle size={32} className="mx-auto mb-3 opacity-30" />
            <p>No comments yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {comments.map(c => (
              <div key={c._id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{c.name}</span>
                      <span className="text-xs text-gray-400">{c.email}</span>
                      <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
                      <span className="text-xs text-gray-400">{formatRelative(c.createdAt)}</span>
                      {statusBadge(c.status)}
                      {c.parent && <span className="badge badge-gray">Reply</span>}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-2">{c.content}</p>
                    {c.article && (
                      <a href={`/blog/${c.article.slug}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 w-fit">
                        <ExternalLink size={10} />
                        <span className="line-clamp-1">{c.article.title}</span>
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {c.status !== 'approved' && (
                      <button onClick={() => setStatus(c._id, 'approved')} title="Approve"
                        className="p-1.5 text-gray-400 hover:text-green-600 transition-colors rounded">
                        <CheckCircle size={15} />
                      </button>
                    )}
                    {c.status !== 'spam' && (
                      <button onClick={() => setStatus(c._id, 'spam')} title="Mark as spam"
                        className="p-1.5 text-gray-400 hover:text-yellow-600 transition-colors rounded">
                        <AlertTriangle size={15} />
                      </button>
                    )}
                    <button onClick={() => del(c._id, c.name)} title="Delete"
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
