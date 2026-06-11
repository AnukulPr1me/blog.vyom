import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Setting } from '@/lib/models';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const settings = await Setting.find().lean();
    const obj: Record<string, any> = {};
    settings.forEach((s: any) => { obj[s.key] = s.value; });
    return NextResponse.json(obj);
  } catch (e: any) {
    console.error('GET /api/settings error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();
    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Save each top-level key as a separate Setting document
    const ops = Object.entries(body).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { key, value } },
        upsert: true,
      },
    }));

    if (ops.length > 0) {
      await Setting.bulkWrite(ops as any);
    }

    // Return the updated settings
    const updated = await Setting.find().lean();
    const obj: Record<string, any> = {};
    updated.forEach((s: any) => { obj[s.key] = s.value; });
    return NextResponse.json(obj);
  } catch (e: any) {
    console.error('PUT /api/settings error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
