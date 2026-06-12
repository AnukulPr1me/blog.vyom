'use client';
import { useState, useEffect, useCallback } from 'react';
import { Save, Globe, Share2, BarChart2, DollarSign, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { safeJson } from '@/lib/fetch-json';

interface SocialLinks {
  twitter: string;
  facebook: string;
  instagram: string;
  youtube: string;
}

interface Settings {
  siteName: string;
  siteTagline: string;
  siteUrl: string;
  siteEmail: string;
  metaDescription: string;
  googleAnalyticsId: string;
  adsensePublisherId: string;
  socialLinks: SocialLinks;
}

const defaults: Settings = {
  siteName: 'Vyom',
  siteTagline: 'Your Tech Universe',
  siteUrl: 'https://vyom.quest',
  siteEmail: 'hi.kio2002@gmail.com',
  metaDescription: '',
  googleAnalyticsId: '',
  adsensePublisherId: '',
  socialLinks: { twitter: '', facebook: '', instagram: '', youtube: '' },
};

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-5"
        style={{ fontFamily: 'var(--font-syne)' }}>
        <Icon size={16} className="text-indigo-500" />{title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  const load = useCallback(async () => {
    try {
      const res  = await fetch('/api/settings');
      const data = await safeJson<any>(res);
      if (res.ok && data) {
        setSettings({
          siteName:          data.siteName          || defaults.siteName,
          siteTagline:       data.siteTagline       || defaults.siteTagline,
          siteUrl:           data.siteUrl           || defaults.siteUrl,
          siteEmail:         data.siteEmail         || defaults.siteEmail,
          metaDescription:   data.metaDescription   || '',
          googleAnalyticsId: data.googleAnalyticsId || '',
          adsensePublisherId:data.adsensePublisherId || '',
          socialLinks: {
            twitter:   data.socialLinks?.twitter   || '',
            facebook:  data.socialLinks?.facebook  || '',
            instagram: data.socialLinks?.instagram || '',
            youtube:   data.socialLinks?.youtube   || '',
          },
        });
      }
    } catch (e) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setField = (k: keyof Omit<Settings, 'socialLinks'>, v: string) =>
    setSettings(s => ({ ...s, [k]: v }));

  const setSocial = (k: keyof SocialLinks, v: string) =>
    setSettings(s => ({ ...s, socialLinks: { ...s.socialLinks, [k]: v } }));

  const save = async () => {
    const token = Cookies.get('vyom_token');
    if (!token) { toast.error('Not authenticated'); return; }
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method:  'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await safeJson<any>(res);
      if (!res.ok) {
        throw new Error(data?.error || `Server error (${res.status} ${res.statusText})`);
      }
      if (data === null) {
        throw new Error('Server returned an empty response. Please check server logs.');
      }
      toast.success('Settings saved!');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="card h-48 animate-pulse bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100"
            style={{ fontFamily: 'var(--font-syne)' }}>Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Site-wide configuration</p>
        </div>
        <button onClick={save} disabled={saving}
          className={`btn-primary gap-2 ${saved ? 'bg-green-600 hover:bg-green-700' : ''}`}>
          {saved
            ? <><CheckCircle size={16} />Saved!</>
            : saving
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
              : <><Save size={16} />Save Changes</>
          }
        </button>
      </div>

      <div className="space-y-6">
        {/* General */}
        <Section icon={Globe} title="General">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Site Name</label>
              <input value={settings.siteName}
                onChange={e => setField('siteName', e.target.value)}
                className="input" placeholder="Vyom" />
            </div>
            <div>
              <label className="label">Tagline</label>
              <input value={settings.siteTagline}
                onChange={e => setField('siteTagline', e.target.value)}
                className="input" placeholder="Your Tech Universe" />
            </div>
            <div>
              <label className="label">Site URL</label>
              <input value={settings.siteUrl}
                onChange={e => setField('siteUrl', e.target.value)}
                className="input" placeholder="https://vyom.quest" />
            </div>
            <div>
              <label className="label">Contact Email</label>
              <input type="email" value={settings.siteEmail}
                onChange={e => setField('siteEmail', e.target.value)}
                className="input" placeholder="hi.kio2002@gmail.com" />
            </div>
          </div>
          <div>
            <label className="label">Default Meta Description</label>
            <textarea value={settings.metaDescription}
              onChange={e => setField('metaDescription', e.target.value)}
              rows={3} className="input resize-none"
              placeholder="Vyom is your go-to source for tech news, smartphone reviews and AI insights." />
          </div>
        </Section>

        {/* Social */}
        <Section icon={Share2} title="Social Links">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['twitter', 'facebook', 'instagram', 'youtube'] as const).map(k => (
              <div key={k}>
                <label className="label capitalize">{k}</label>
                <input
                  value={settings.socialLinks[k]}
                  onChange={e => setSocial(k, e.target.value)}
                  placeholder={`https://${k}.com/vyomquest`}
                  className="input"
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Analytics */}
        <Section icon={BarChart2} title="Google Analytics">
          <div className="max-w-sm">
            <label className="label">Measurement ID</label>
            <input value={settings.googleAnalyticsId}
              onChange={e => setField('googleAnalyticsId', e.target.value)}
              placeholder="G-XXXXXXXXXX" className="input font-mono" />
            <p className="text-xs text-gray-400 mt-1.5">Leave empty to disable tracking.</p>
          </div>
        </Section>

        {/* AdSense */}
        <Section icon={DollarSign} title="Google AdSense">
          <div className="max-w-sm">
            <label className="label">Publisher ID</label>
            <input value={settings.adsensePublisherId}
              onChange={e => setField('adsensePublisherId', e.target.value)}
              placeholder="ca-pub-XXXXXXXXXXXXXXXX" className="input font-mono" />
            <p className="text-xs text-gray-400 mt-1.5">Leave empty to disable ads.</p>
          </div>
        </Section>

        {/* SEO Tools */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4"
            style={{ fontFamily: 'var(--font-syne)' }}>SEO Tools</h2>
          <div className="flex flex-wrap gap-3">
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">
              Sitemap ↗
            </a>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">
              Robots.txt ↗
            </a>
            <a href="/api/seo/rss" target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">
              RSS Feed ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
