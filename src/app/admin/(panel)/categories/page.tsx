'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { makeSlug } from '@/lib/utils';
import type { Category } from '@/types';
import Cookies from 'js-cookie';

const empty = { name: '', slug: '', description: '', order: '0', showInNav: true, showInFooter: true };

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'new' | Category | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const headers = useCallback(() => {
    const token = Cookies.get('vyom_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/categories', { headers: headers() })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setCats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [headers]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm({ ...empty }); setModal('new'); };
  const openEdit = (c: Category) => {
    setForm({ name: c.name, slug: c.slug, description: c.description || '', order: String(c.order), showInNav: c.showInNav, showInFooter: c.showInFooter });
    setModal(c);
  };

  const submit = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      const body = { ...form, slug: form.slug || makeSlug(form.name), order: Number(form.order) };
      const isEdit = modal !== 'new';
      const url = isEdit ? `/api/categories/${(modal as Category)._id}` : '/api/categories';
      const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: headers(), body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(isEdit ? 'Updated' : 'Created');
      setModal(null); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const toggle = async (c: Category) => {
    try {
      await fetch(`/api/categories/${c._id}`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ isActive: !c.isActive }) });
      load();
    } catch { toast.error('Failed'); }
  };

  const del = async (c: Category) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    try { await fetch(`/api/categories/${c._id}`, { method: 'DELETE', headers: headers() }); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>Categories</h1>
          <p className="text-sm text-gray-400 mt-0.5">Changes reflect everywhere instantly</p>
        </div>
        <button onClick={openNew} className="btn-primary gap-2"><Plus size={16} />New Category</button>
      </div>

      <div className="card overflow-hidden">
        {loading ? <div className="p-6 space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-12 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />)}</div>
        : cats.length === 0 ? <div className="p-12 text-center text-gray-400"><p>No categories. <button onClick={openNew} className="text-indigo-600 dark:text-indigo-400 hover:underline">Create one →</button></p></div>
        : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Slug</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Nav/Footer</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {cats.map(c => (
                <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{c.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-400 text-xs font-mono">{c.slug}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(c)} className={`badge cursor-pointer hover:opacity-80 ${c.isActive ? 'badge-green' : 'badge-gray'}`}>
                      {c.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex gap-3 text-xs">
                      <span className={`flex items-center gap-1 ${c.showInNav ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>{c.showInNav ? <Check size={10} /> : <X size={10} />} Nav</span>
                      <span className={`flex items-center gap-1 ${c.showInFooter ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>{c.showInFooter ? <Check size={10} /> : <X size={10} />} Footer</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => del(c)} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'var(--font-syne)' }}>{modal === 'new' ? 'New Category' : 'Edit Category'}</h2>
            <div className="space-y-4">
              <div><label className="label">Name *</label><input value={form.name} onChange={e => { set('name', e.target.value); if (modal === 'new') set('slug', makeSlug(e.target.value)); }} className="input" /></div>
              <div><label className="label">Slug</label><input value={form.slug} onChange={e => set('slug', e.target.value)} className="input font-mono text-sm" /></div>
              <div><label className="label">Description</label><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className="input resize-none" /></div>
              <div><label className="label">Display Order</label><input type="number" value={form.order} onChange={e => set('order', e.target.value)} className="input" /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.showInNav} onChange={e => set('showInNav', e.target.checked)} className="rounded" /><span className="text-sm">Show in Nav</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.showInFooter} onChange={e => set('showInFooter', e.target.checked)} className="rounded" /><span className="text-sm">Show in Footer</span></label>
              </div>
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
