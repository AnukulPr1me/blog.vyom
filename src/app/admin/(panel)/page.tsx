'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Eye, CheckCircle, Clock, Plus, TrendingUp, MessageSquare, Users, FolderOpen, Settings } from 'lucide-react';
import { formatRelative } from '@/lib/utils';
import type { Article } from '@/types';
import Cookies from 'js-cookie';

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}><Icon size={20} /></div>
      <div>
        <p className="text-2xl font-black text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>{value.toLocaleString()}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [total, setTotal] = useState(0);
  const [published, setPublished] = useState(0);
  const [drafts, setDrafts] = useState(0);
  const [views, setViews] = useState(0);
  const [recent, setRecent] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const token = Cookies.get('vyom_token');
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch('/api/articles?admin=true&limit=6&sort=-createdAt', { headers: h }).then(r => r.json()),
      fetch('/api/articles?admin=true&limit=1', { headers: h }).then(r => r.json()),
      fetch('/api/articles?admin=true&limit=1&status=published', { headers: h }).then(r => r.json()),
      fetch('/api/articles?admin=true&limit=1&status=draft', { headers: h }).then(r => r.json()),
    ]).then(([rec, tot, pub, dft]) => {
      setRecent(rec.articles || []);
      setTotal(tot.total || 0);
      setPublished(pub.total || 0);
      setDrafts(dft.total || 0);
      setViews((rec.articles || []).reduce((s: number, a: Article) => s + a.viewCount, 0));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Welcome back to Vyom Admin</p>
        </div>
        <Link href="/admin/articles/new" className="btn-primary gap-2"><Plus size={16} />New Article</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText}    label="Total Articles" value={total}     color="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" />
        <StatCard icon={CheckCircle} label="Published"      value={published} color="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
        <StatCard icon={Clock}       label="Drafts"         value={drafts}    color="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" />
        <StatCard icon={Eye}         label="Total Views"    value={views}     color="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2" style={{ fontFamily: 'var(--font-syne)' }}>
              <TrendingUp size={16} className="text-indigo-500" />Recent Articles
            </h2>
            <Link href="/admin/articles" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
          ) : recent.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <FileText size={32} className="mx-auto mb-3 opacity-30" />
              <p>No articles yet. <Link href="/admin/articles/new" className="text-indigo-600 dark:text-indigo-400 hover:underline">Create your first →</Link></p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recent.map(a => (
                <div key={a._id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/admin/articles/${a._id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm line-clamp-1 transition-colors">{a.title}</Link>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      {a.category && <span>{a.category.name}</span>}
                      <span>·</span><span>{formatRelative(a.createdAt)}</span>
                    </div>
                  </div>
                  <span className={`badge flex-shrink-0 ${a.status === 'published' ? 'badge-green' : a.status === 'scheduled' ? 'badge-yellow' : 'badge-gray'}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4" style={{ fontFamily: 'var(--font-syne)' }}>Quick Actions</h2>
          <div className="space-y-1">
            {([
              { href: '/admin/articles/new', Icon: Plus,        label: 'New Article',        cls: 'text-indigo-600 dark:text-indigo-400' },
              { href: '/admin/categories',   Icon: FolderOpen,  label: 'Categories',         cls: 'text-purple-600 dark:text-purple-400' },
              { href: '/admin/authors',      Icon: Users,       label: 'Authors',            cls: 'text-green-600 dark:text-green-400' },
              { href: '/admin/messages',     Icon: MessageSquare, label: 'Messages',         cls: 'text-orange-600 dark:text-orange-400' },
              { href: '/admin/settings',     Icon: Settings,    label: 'Site Settings',      cls: 'text-gray-500 dark:text-gray-400' },
            ] as const).map(({ href, Icon, label, cls }) => (
              <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                <Icon size={15} className={cls} />{label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
