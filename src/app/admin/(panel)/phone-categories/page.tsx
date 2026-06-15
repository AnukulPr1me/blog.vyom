'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { makeSlug } from '@/lib/utils';
import { safeJson } from '@/lib/fetch-json';
import type { PhoneCategory } from '@/types';
import Cookies from 'js-cookie';

const empty = { name: '', slug: '', description: '', icon: 'Smartphone', order: '0', isActive: true };

const ICON_OPTIONS = ['Smartphone', 'Wallet', 'Crown', 'Camera', 'Gamepad2', 'Star', 'Zap', 'Award'];

export default function AdminPhoneCategoriesPage() {
  const [cats, setCats] = useState<PhoneCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'new' | PhoneCategory | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const headers = useCallback(() => {
    const token = Cookies.get('vyom_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/phone-categories', { headers: headers() });
      const data = await safeJson<PhoneCategory[]>(res);
      if (Array.isArray(data)) setCats(data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm({ ...empty }); setModal('new'); };
  const openEdit = (c: PhoneCategory) => {
    setForm({
      name: c.name, slug: c.slug, description: c.description || '',
      icon: c.icon || 'Smartphone', order: String(c.order), isActive: c.isActive,
    });
    setModal(c);
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const body = { ...form, slug: form.slug || makeSlug(form.name), order: Number(form.order) || 0 };
      const isEdit = modal !== 'new';
      const url = isEdit ? `/api/phone-categories/${(modal as PhoneCategory)._id}` : '/api/phone-categories';
      const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: headers(), body: JSON.stringify(body) });
      const data = await safeJson<any>(res);
      if (!res.ok) throw new Error(data?.error || `Server error (${res.status})`);
      toast.success(isEdit ? 'Updated' : 'Created');
      setModal(null);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c: PhoneCategory) => {
    try {
      const res = await fetch(`/api/phone-categories/${c._id}`, {
        method: 'PATCH', headers: headers(), body: JSON.stringify({ isActive: !c.isActive }),
      });
      if (!res.ok) throw new Error('Failed');
      load();
    } catch {
      toast.error('Failed to update');
    }
  };

  const del = async (c: PhoneCategory) => {
    if (!confirm(`Delete "${c.name}"? Phones in this category must be moved/deleted first.`)) return;
    try {
      const res = await fetch(`/api/phone-categories/${c._id}`, { method: 'DELETE', headers: headers() });
      const data = await safeJson<any>(res);
      if (!res.ok) throw new Error(data?.error || 'Failed to delete');
      toast.success('Deleted');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>
            Phone Categories
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">e.g. Budget, Mid-range, Flagship, Camera, Gaming</p>
        </div>
        <button onClick={openNew} className="btn-primary gap-2"><Plus size={16} />New Category</button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-12 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />)}</div>
        ) : cats.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Smartphone size={32} className="mx-auto mb-3 opacity-30" />
            <p>No phone categories yet. <button onClick={openNew} className="text-indigo-600 dark:text-indigo-400 hover:underline">Create one →</button></p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Slug</th>
                <th className="px-4 py-3 text-left">Status</th>
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
            <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'var(--font-syne)' }}>{modal === 'new' ? 'New Phone Category' : 'Edit Phone Category'}</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Name *</label>
                <input value={form.name} onChange={e => { set('name', e.target.value); if (modal === 'new') set('slug', makeSlug(e.target.value)); }} className="input" placeholder="e.g. Flagship" />
              </div>
              <div>
                <label className="label">Slug</label>
                <input value={form.slug} onChange={e => set('slug', e.target.value)} className="input font-mono text-sm" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className="input resize-none" placeholder="Short description shown on the category page" />
              </div>
              <div>
                <label className="label">Icon</label>
                <select value={form.icon} onChange={e => set('icon', e.target.value)} className="input">
                  {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Display Order</label>
                <input type="number" value={form.order} onChange={e => set('order', e.target.value)} className="input" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Active (show on site)</span>
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
