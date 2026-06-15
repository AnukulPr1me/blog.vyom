import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { PhoneCategory } from '@/lib/models';
import { requireAuth } from '@/lib/auth';
import { makeSlug } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') === 'true';
    const filter = activeOnly ? { isActive: true } : {};
    const cats = await PhoneCategory.find(filter).sort({ order: 1, name: 1 }).lean();
    return NextResponse.json(cats);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  if (!body?.name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  try {
    await dbConnect();
    const slug = body.slug || makeSlug(body.name);
    const exists = await PhoneCategory.findOne({ slug });
    if (exists) return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 409 });
    const cat = await PhoneCategory.create({ ...body, slug });
    return NextResponse.json(cat, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
