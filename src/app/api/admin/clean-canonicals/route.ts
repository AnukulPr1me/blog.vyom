import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Article } from '@/lib/models';
import { requireAuth } from '@/lib/auth';

/**
 * POST /api/admin/clean-canonicals
 *
 * One-time cleanup endpoint — removes all canonicalUrl values that point
 * to external domains (the canonical hijacking attack vector).
 *
 * Run this once after deploying to clear any poisoned values from your DB.
 * Requires admin authentication.
 */
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vyom.quest').replace(/\/$/, '');
    const ownHost = new URL(siteUrl).hostname;

    // Find all articles that have a canonicalUrl set
    const articles = await Article.find({
      canonicalUrl: { $exists: true, $nin: [null, ''] },
    }).select('_id title canonicalUrl slug').lean();

    const poisoned: string[] = [];
    const safe: string[] = [];

    for (const article of articles as any[]) {
      const url: string = article.canonicalUrl || '';
      let isExternal = false;

      if (url.startsWith('/')) {
        isExternal = false; // relative path — safe
      } else {
        try {
          const parsed = new URL(url);
          isExternal = parsed.hostname !== ownHost && parsed.hostname !== `www.${ownHost}`;
        } catch {
          isExternal = true; // invalid URL — treat as poisoned
        }
      }

      if (isExternal) {
        poisoned.push(`${article.title} (${url})`);
        await Article.findByIdAndUpdate(article._id, { $unset: { canonicalUrl: 1 } });
      } else {
        safe.push(article.title);
      }
    }

    return NextResponse.json({
      message: `Cleaned ${poisoned.length} poisoned canonical URLs. ${safe.length} safe URLs kept.`,
      poisoned,
      safe,
    });
  } catch (e: any) {
    console.error('clean-canonicals error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}