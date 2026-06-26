import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Article } from '@/lib/models';
import { requireAuth } from '@/lib/auth';
import { makeSlug, calcReadingTime, generateExcerpt } from '@/lib/utils';

function sanitizeCanonicalUrl(url: string | undefined): string | undefined {
  if (!url || url.trim() === '') return undefined;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vyom.quest').replace(/\/$/, '');
  const trimmed = url.trim();
  if (trimmed.startsWith('/')) return `${siteUrl}${trimmed}`;
  try {
    const parsed = new URL(trimmed);
    const ownHost = new URL(siteUrl).hostname;
    if (parsed.hostname === ownHost || parsed.hostname === `www.${ownHost}`) return trimmed;
  } catch { /* invalid URL */ }
  console.warn(`[security] Rejected external canonicalUrl on update: ${trimmed}`);
  return undefined;
}
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const admin = searchParams.get('admin') === 'true';

    const isObjectId = mongoose.isValidObjectId(params.id);
    const query: any = isObjectId ? { _id: params.id } : { slug: params.id };
    if (!admin) query.status = 'published';

    const article = await Article.findOne(query)
      .populate('category', 'name slug description')
      .populate('author', 'name avatar slug bio socialLinks')
      .lean();

    if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

    return NextResponse.json(article);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const body = await req.json();

    const existing = await Article.findById(params.id).lean();
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Auto-generate fields
    if (body.content) {
      body.readingTime = calcReadingTime(body.content);
      if (!body.excerpt) body.excerpt = generateExcerpt(body.content);
    }
    if (body.title && !body.slug) body.slug = makeSlug(body.title);
    if (!body.metaTitle) body.metaTitle = body.title || (existing as any).title;
    if (!body.metaDescription) body.metaDescription = body.excerpt || (existing as any).excerpt;

    // Set publishedAt when first publishing
    if (body.status === 'published' && (existing as any).status !== 'published') {
      body.publishedAt = new Date();
    }

    // Save a revision (keep last 10)
    const revisionData = { ...(existing as any), savedAt: new Date() };
    delete revisionData.revisions;
    await Article.findByIdAndUpdate(params.id, {
      $push: { revisions: { $each: [revisionData], $slice: -10 } },
    });

    const updated = await Article.findByIdAndUpdate(params.id, { $set: body }, { new: true })
      .populate('category', 'name slug')
      .populate('author', 'name avatar slug');

    // Edited/published articles should reflect immediately on the site
    // and sitemap, not wait for the revalidate window.
    if (updated) {
      revalidatePath('/');
      revalidatePath('/sitemap.xml');
      revalidatePath(`/blog/${(updated as any).slug}`);
      if ((existing as any).slug !== (updated as any).slug) {
        // Old slug becomes a 404 immediately too
        revalidatePath(`/blog/${(existing as any).slug}`);
      }
    }

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const deleted = await Article.findByIdAndDelete(params.id).lean();

    if (deleted) {
      revalidatePath('/');
      revalidatePath('/sitemap.xml');
      revalidatePath(`/blog/${(deleted as any).slug}`);
    }

    return NextResponse.json({ message: 'Deleted' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
