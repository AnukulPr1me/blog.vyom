'use client';
import { useState, useEffect, useCallback } from 'react';
import { Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Tag as ITag } from '@/types';
import Cookies from 'js-cookie';

export default function AdminTagsPage() {
  const [tags, setTags] = useState<ITag[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const token = Cookies.get('vyom_token');
    setLoading(true);
    fetch('/api/tags', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setTags(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const del = async (tag: ITag) => {
    if (!confirm(`Delete tag "${tag.name}"?`)) return;
    const token = Cookies.get('vyom_token');
    try {
      await fetch(`/api/tags/${tag._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      toast.success('Deleted'); load();
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>Tags</h1>
        <p className="text-sm text-gray-400 mt-0.5">{tags.length} tags — auto-created from articles</p>
      </div>
      {loading ? <div className="flex flex-wrap gap-2">{Array(12).fill(0).map((_, i) => <div key={i} className="h-8 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />)}</div>
      : tags.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Tag size={32} className="mx-auto mb-3 opacity-30" />
          <p>No tags yet. Add tags to articles and they will appear here.</p>
        </div>
      ) : (
        <div className="card p-6">
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag._id} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 group">
                <Tag size={11} className="text-indigo-500" />{tag.name}
                <button onClick={() => del(tag)} className="text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors ml-0.5 opacity-0 group-hover:opacity-100">
                  <Trash2 size={11} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
