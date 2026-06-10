'use client';
import { useState, useEffect, useCallback } from 'react';
import { Save, Globe, Share2, BarChart2, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

interface Settings {
  siteName: string; siteTagline: string; siteUrl: string; siteEmail: string;
  metaDescription: string; googleAnalyticsId: string; adsensePublisherId: string;
  socialLinks: { twitter: string; facebook: string; instagram: string; youtube: string };
}

const defaults: Settings = {
  siteName: 'Vyom', siteTagline: 'Your Tech Universe',
  siteUrl: 'https://vyom.quest', siteEmail: 'hello@vyom.quest',
  metaDescription: '', googleAnalyticsId: '', adsensePublisherId: '',
  socialLinks: { twitter: '', facebook: '', instagram: '', youtube: '' },
};

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-5" style={{ fontFamily: 'var(--font-syne)' }}>
        <Icon size={16} className="text-indigo-500" />{title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setSettings({
        siteName: d.siteName || defaults.siteName,
        siteTagline: d.siteTagline || defaults.siteTagline,
        siteUrl: d.siteUrl || defaults.siteUrl,
        siteEmail: d.siteEmail || defaults.siteEmail,
        metaDescription: d.metaDescription || '',
        googleAnalyticsId: d.googleAnalyticsId || '',
        adsensePublisherId: d.adsensePublisherId || '',
        socialLinks: d.socialLinks || defaults.socialLinks,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: keyof Settings, v: any) => setSettings(s => ({ ...s, [k]: v }));
  const setSocial = (k: string, v: string) => setSettings(s => ({ ...s, socialLinks: { ...s.socialLinks, [k]: v } }));

  const save = async () => {
    const token = Cookies.get('vyom_token');
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Settings saved!');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="card h-48 animate-pulse" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Site-wide configuration</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary gap-2">
          <Save size={16} />{saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        <Section icon={Globe} title="General">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Site Name</label><input value={settings.siteName} onChange={e => set('siteName', e.target.value)} className="input" /></div>
            <div><label className="label">Tagline</label><input value={settings.siteTagline} onChange={e => set('siteTagline', e.target.value)} className="input" /></div>
            <div><label className="label">Site URL</label><input value={settings.siteUrl} onChange={e => set('siteUrl', e.target.value)} className="input" /></div>
            <div><label className="label">Contact Email</label><input type="email" value={settings.siteEmail} onChange={e => set('siteEmail', e.target.value)} className="input" /></div>
          </div>
          <div><label className="label">Default Meta Description</label><textarea value={settings.metaDescription} onChange={e => set('metaDescription', e.target.value)} rows={3} className="input resize-none" /></div>
        </Section>

        <Section icon={Share2} title="Social Links">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['twitter','facebook','instagram','youtube'].map(k => (
              <div key={k}><label className="label capitalize">{k}</label><input value={settings.socialLinks[k]} onChange={e => setSocial(k, e.target.value)} placeholder="https://…" className="input" /></div>
            ))}
          </div>
        </Section>

        <Section icon={BarChart2} title="Google Analytics">
          <div className="max-w-sm">
            <label className="label">Measurement ID</label>
            <input value={settings.googleAnalyticsId} onChange={e => set('googleAnalyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" className="input font-mono" />
            <p className="text-xs text-gray-400 mt-1.5">Leave empty to disable.</p>
          </div>
        </Section>

        <Section icon={DollarSign} title="Google AdSense">
          <div className="max-w-sm">
            <label className="label">Publisher ID</label>
            <input value={settings.adsensePublisherId} onChange={e => set('adsensePublisherId', e.target.value)} placeholder="ca-pub-XXXXXXXXXXXXXXXX" className="input font-mono" />
            <p className="text-xs text-gray-400 mt-1.5">Leave empty to disable.</p>
          </div>
        </Section>

        <div className="card p-6">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4" style={{ fontFamily: 'var(--font-syne)' }}>SEO Tools</h2>
          <div className="flex flex-wrap gap-3">
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">View sitemap.xml ↗</a>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">View robots.txt ↗</a>
            <a href="/api/seo/rss" target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">View RSS Feed ↗</a>
          </div>
        </div>
      </div>
    </div>
  );
}
