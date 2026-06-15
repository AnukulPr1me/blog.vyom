import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Phone } from '@/lib/models';
import { requireAuth } from '@/lib/auth';
import { makeSlug } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(50, Number(searchParams.get('limit') || 12));
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || '-createdAt';
    const admin = searchParams.get('admin') === 'true';

    const filter: any = {};
    if (!admin) filter.isActive = true;
    if (category) filter.category = category;
    if (featured) filter.isFeatured = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [phones, total] = await Promise.all([
      Phone.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Phone.countDocuments(filter),
    ]);

    return NextResponse.json({ phones, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e: any) {
    console.error('GET /api/phones error:', e);
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

  if (!body?.name || !body?.brand || !body?.category) {
    return NextResponse.json({ error: 'Name, brand and category are required' }, { status: 400 });
  }

  try {
    await dbConnect();
    const slug = body.slug || makeSlug(`${body.brand}-${body.name}`);
    const exists = await Phone.findOne({ slug });
    if (exists) return NextResponse.json({ error: 'A phone with this slug already exists' }, { status: 409 });

    const phone = await Phone.create({ ...body, slug });

    revalidatePath('/phones');
    revalidatePath(`/phones/${slug}`);

    return NextResponse.json(phone, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/phones error:', e);
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
