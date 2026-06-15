import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Phone } from '@/lib/models';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const phone = await Phone.findById(params.id).populate('category', 'name slug').lean();
    if (!phone) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(phone);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  try {
    await dbConnect();
    const existing = await Phone.findById(params.id).lean();
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await Phone.findByIdAndUpdate(params.id, { $set: body }, { new: true })
      .populate('category', 'name slug');

    if (updated) {
      revalidatePath('/phones');
      revalidatePath(`/phones/${(updated as any).slug}`);
      if ((existing as any).slug !== (updated as any).slug) {
        revalidatePath(`/phones/${(existing as any).slug}`);
      }
    }

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error('PUT /api/phones/[id] error:', e);
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const deleted = await Phone.findByIdAndDelete(params.id).lean();

    if (deleted) {
      revalidatePath('/phones');
      revalidatePath(`/phones/${(deleted as any).slug}`);
    }

    return NextResponse.json({ message: 'Deleted' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
