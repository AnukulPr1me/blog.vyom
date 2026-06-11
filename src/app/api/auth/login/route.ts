import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim(), isActive: true }).lean();
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await comparePassword(password, (user as any).password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({
      userId: String((user as any)._id),
      email: (user as any).email,
      role: (user as any).role,
    });

    const res = NextResponse.json({
      token,
      user: {
        id: String((user as any)._id),
        email: (user as any).email,
        name: (user as any).name,
        role: (user as any).role,
      },
    });

    // Set as a regular (non-httpOnly) cookie so js-cookie can read it client-side
    // Also set for middleware (server-side) to read
    res.cookies.set('vyom_token', token, {
      httpOnly: false,   // Must be false so js-cookie can read it in the browser
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    return res;
  } catch (e: any) {
    console.error('Login error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
