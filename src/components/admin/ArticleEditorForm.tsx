'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, RefreshCw, Eye, Save, Send } from 'lucide-react';
import { makeSlug, calcReadingTime, generateExcerpt } from '@/lib/utils';
import type { Category, Author, Article } from '@/types';
import RichEditor from './RichEditor';
import Cookies from 'js-cookie';

interface Props { article?: Article; }

export default function ArticleEditorForm({ article }: Props) {
  const router = useRouter();
  const isEdit = !!article;

  const [title, setTitle] = useState(article?.title || '');
  const [slug, setSlug] = useState(article?.slug || '');
  const [content, setContent] = useState(article?.content || '');
  const [featuredImage, setFeaturedImage] = useState(article?.featuredImage || '');
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [category, setCategory] = useState((article?.category as any)?._id || '');
  const [author, setAuthor] = useState((article?.author as any)?._id || '');
  const [tags, setTags] = useState(article?.tags?.join(', ') || '');
  const [status, setStatus] = useState(article?.status || 'draft');
  const [scheduledAt, setScheduledAt] = useState(
    article?.scheduledAt ? new Date(article.scheduledAt).toISOString().slice(0, 16) : ''
  );
  const [seoOpen, setSeoOpen] = useState(false);
  const [metaTitle, setMetaTitle] = useState(article?.metaTitle || '');
  const [metaDesc, setMetaDesc] = useState(article?.metaDescription || '');
  const [seoKeywords, setSeoKeywords] = useState(article?.seoKeywords?.join(', ') || '');
  const [canonical, setCanonical] = useState(article?.canonicalUrl || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(isEdit);

  const loadData = useCallback(() => {
    const token = Cookies.get('vyom_token');
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch('/api/categories', { headers: h }).then(r => r.json()),
      fetch('/api/authors?admin=true', { headers: h }).then(r => r.json()),
    ]).then(([cats, auths]) => {
      if (Array.isArray(cats)) setCategories(cats);
      if (Array.isArray(auths)) setAuthors(auths);
    }).catch(() => {});
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!slugEdited && title) setSlug(makeSlug(title));
  }, [title, slugEdited]);

  const save = async (overrideStatus?: string) => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!content.trim()) { toast.error('Content is required'); return; }
    const token = Cookies.get('vyom_token');
    setSaving(true);
    try {
      const payload = {
        title, slug: slug || makeSlug(title), content,
        featuredImage: featuredImage || undefined,
        excerpt: excerpt || generateExcerpt(content),
        tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        category: category || undefined,
        author: author || undefined,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDesc || undefined,
        seoKeywords: seoKeywords.split(',').map((k: string) => k.trim()).filter(Boolean),
        canonicalUrl: canonical || undefined,
        status: overrideStatus || status,
        scheduledAt: (overrideStatus || status) === 'scheduled' && scheduledAt
          ? new Date(scheduledAt).toISOString() : undefined,
      };
      const url = isEdit ? `/api/articles/${article!._id}` : '/api/articles';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(isEdit ? 'Article updated!' : 'Article created!');
      if (!isEdit) router.push(`/admin/articles/${data._id}`);
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const readingTime = content ? calcReadingTime(content) : 0;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>
            {isEdit ? 'Edit Article' : 'New Article'}
          </h1>
          {readingTime > 0 && <p className="text-xs text-gray-400 mt-0.5">~{readingTime} min read</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {article?.slug && (
            <a href={`/blog/${article.slug}`} target="_blank" rel="noopener noreferrer"
              className="btn-outline gap-1.5 text-xs py-2">
              <Eye size={13} />Preview
            </a>
          )}
          <button onClick={() => save('draft')} disabled={saving} className="btn-secondary gap-1.5 text-xs py-2">
            <Save size={13} />{saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button onClick={() => save('published')} disabled={saving} className="btn-primary gap-1.5 text-xs py-2">
            <Send size={13} />{saving ? 'Saving…' : isEdit ? 'Update & Publish' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <label className="label">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Article title…" className="input text-lg font-semibold" />
          </div>

          <div>
            <label className="label flex items-center justify-between">
              <span>Slug</span>
              <button type="button" onClick={() => { setSlug(makeSlug(title)); setSlugEdited(false); }}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                <RefreshCw size={10} />Auto-generate
              </button>
            </label>
            <input value={slug} onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
              placeholder="article-url-slug" className="input font-mono text-sm" />
          </div>

          <div>
            <label className="label">Content *</label>
            <RichEditor value={content} onChange={setContent} />
          </div>

          <div>
            <label className="label">Excerpt</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3}
              placeholder="Short description (auto-generated if left empty)" className="input resize-none" />
            <p className="text-xs text-gray-400 mt-1">{excerpt.length}/160</p>
          </div>

          {/* SEO accordion */}
          <div className="card overflow-visible">
            <button type="button" onClick={() => setSeoOpen(!seoOpen)}
              className="w-full flex items-center justify-between p-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Advanced SEO Settings
              {seoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {seoOpen && (
              <div className="p-4 pt-0 space-y-4 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <label className="label">Meta Title</label>
                  <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)}
                    placeholder={title || 'Defaults to article title'} className="input" />
                </div>
                <div>
                  <label className="label">Meta Description</label>
                  <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)}
                    rows={2} placeholder="Defaults to excerpt…" className="input resize-none" />
                </div>
                <div>
                  <label className="label">SEO Keywords</label>
                  <input value={seoKeywords} onChange={e => setSeoKeywords(e.target.value)}
                    placeholder="keyword1, keyword2…" className="input" />
                </div>
                <div>
                  <label className="label">Canonical URL</label>
                  <input value={canonical} onChange={e => setCanonical(e.target.value)}
                    placeholder="https://vyom.quest/blog/…" className="input" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Publish</h3>
            <div>
              <label className="label">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            {status === 'scheduled' && (
              <div>
                <label className="label">Schedule For</label>
                <input type="datetime-local" value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)} className="input" />
              </div>
            )}
            <div>
              <label className="label">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input">
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Author</label>
              <select value={author} onChange={e => setAuthor(e.target.value)} className="input">
                <option value="">Select author</option>
                {authors.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          <div className="card p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Featured Image</h3>
            <input value={featuredImage} onChange={e => setFeaturedImage(e.target.value)}
              placeholder="https://example.com/image.jpg" className="input text-xs" />
            {featuredImage && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featuredImage} alt="Preview" className="w-full h-full object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-3">Tags</h3>
            <input value={tags} onChange={e => setTags(e.target.value)}
              placeholder="smartphones, review, android" className="input text-xs" />
            <p className="text-xs text-gray-400 mt-1.5">Comma-separated</p>
          </div>
        </div>
      </div>
    </div>
  );
}
