import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge Runtime middleware — no Node.js APIs allowed.
 * Validates JWT structure and expiry without crypto verification.
 * Full cryptographic verification happens in each API route (Node.js runtime).
 */
function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Decode base64url payload
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '==='.slice((base64.length + 3) % 4);
    const payload = JSON.parse(atob(padded));

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;

    // Accept tokens with either "sub" (standard) or "userId" (our legacy field)
    const hasId = payload.sub || payload.userId;
    const hasEmail = payload.email;
    if (!hasId || !hasEmail) return false;

    return true;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin/* routes — but NOT /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('vyom_token')?.value;

    if (!token || !isTokenValid(token)) {
      const loginUrl = new URL('/admin/login', req.url);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('vyom_token');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
