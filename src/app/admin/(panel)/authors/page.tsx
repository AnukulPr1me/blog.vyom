'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { makeSlug } from '@/lib/utils';
import type { Author } from '@/types';
import Cookies from 'js-cookie';

const empty = { name: '', slug: '', email: '', avatar: '', bio: '', twitter: '', linkedin: '', github: '', website: '', isActive: true };

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'new' | Author | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const getHeaders = useCallback(() => {
    const token = Cookies.get('vyom_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/authors?admin=true', { headers: getHeaders() })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setAuthors(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [getHeaders]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (a: Author) => {
    setForm({ name: a.name, slug: a.slug, email: a.email || '', avatar: a.avatar || '', bio: a.bio || '',
      twitter: a.socialLinks?.twitter || '', linkedin: a.socialLinks?.linkedin || '',
      github: a.socialLinks?.github || '', website: a.socialLinks?.website || '', isActive: a.isActive });
    setModal(a);
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      const body = { name: form.name, slug: form.slug || makeSlug(form.name), email: form.email, avatar: form.avatar, bio: form.bio, isActive: form.isActive,
        socialLinks: { twitter: form.twitter, linkedin: form.linkedin, github: form.github, website: form.website } };
      const isEdit = modal !== 'new';
      const url = isEdit ? `/api/authors/${(modal as Author)._id}` : '/api/authors';
      const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: getHeaders(), body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(isEdit ? 'Updated' : 'Created');
      setModal(null); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const del = async (a: Author) => {
    if (!confirm(`Delete "${a.name}"?`)) return;
    try { await fetch(`/api/authors/${a._id}`, { method: 'DELETE', headers: getHeaders() }); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>Authors</h1>
          <p className="text-sm text-gray-400 mt-0.5">{authors.length} authors</p>
        </div>
        <button onClick={() => { setForm({ ...empty }); setModal('new'); }} className="btn-primary gap-2"><Plus size={16} />New Author</button>
      </div>

      {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array(3).fill(0).map((_, i) => <div key={i} className="card h-36 animate-pulse" />)}</div>
      : authors.length === 0 ? <div className="card p-12 text-center text-gray-400"><p>No authors yet.</p></div>
      : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {authors.map(a => (
            <div key={a._id} className="card p-5">
              <div className="flex items-start gap-3 mb-3">
                {a.avatar ? <Image src={a.avatar} alt={a.name} width={48} height={48} className="rounded-full flex-shrink-0" />
                  : <span className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">{a.name[0]}</span>
                }
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-gray-100 truncate" style={{ fontFamily: 'var(--font-syne)' }}>{a.name}</p>
                  {a.email && <p className="text-xs text-gray-400 truncate">{a.email}</p>}
                  <span className={`badge mt-1 ${a.isActive ? 'badge-green' : 'badge-gray'}`}>{a.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              {a.bio && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{a.bio}</p>}
              <div className="flex justify-end gap-1">
                <button onClick={() => openEdit(a)} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"><Pencil size={13} /></button>
                <button onClick={() => del(a)} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg p-6 my-4">
            <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'var(--font-syne)' }}>{modal === 'new' ? 'New Author' : 'Edit Author'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="label">Name *</label><input value={form.name} onChange={e => { set('name', e.target.value); if (modal === 'new') set('slug', makeSlug(e.target.value)); }} className="input" /></div>
                <div><label className="label">Slug</label><input value={form.slug} onChange={e => set('slug', e.target.value)} className="input font-mono text-sm" /></div>
                <div><label className="label">Email</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input" /></div>
              </div>
              <div><label className="label">Avatar URL</label><input value={form.avatar} onChange={e => set('avatar', e.target.value)} placeholder="https://…" className="input" /></div>
              <div><label className="label">Bio</label><textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} className="input resize-none" /></div>
              <div>
                <p className="label">Social Links</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['twitter','linkedin','github','website'].map(k => (
                    <input key={k} value={(form as any)[k]} onChange={e => set(k, e.target.value)} placeholder={k.charAt(0).toUpperCase()+k.slice(1)} className="input text-xs" />
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={submit} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
