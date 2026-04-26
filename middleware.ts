import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminEmailsFromEnv, isInternalApiDevUnscopedAllowed } from '@/lib/internal/adminEmailsEnv';

const PROTECTED_ROUTES = ['/dashboard'];
const INTERNAL_PREFIX = '/internal';
const ADMIN_EMAILS = getAdminEmailsFromEnv();

function getToken(request: NextRequest, sbUrl: string): string | undefined {
  return (
    request.cookies.get('sb-access-token')?.value ??
    request.cookies.get(`sb-${new URL(sbUrl).hostname.split('.')[0]}-auth-token`)?.value
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const incomingRid = request.headers.get('x-request-id')?.trim();
  const requestId =
    incomingRid && incomingRid.length > 0 ? incomingRid : crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  const isInternal = pathname === INTERNAL_PREFIX || pathname.startsWith(`${INTERNAL_PREFIX}/`);
  const isProtected = PROTECTED_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (!isProtected && !isInternal) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!sbUrl) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const token = getToken(request, sbUrl);

  if (!token) {
    if (isInternal) {
      return new NextResponse('Forbidden', { status: 403 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isInternal) {
    if (ADMIN_EMAILS.length > 0) {
      const { createClient } = await import('@supabase/supabase-js');
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceKey) {
        return new NextResponse('Forbidden', { status: 403 });
      }
      try {
        const sb = createClient(sbUrl, serviceKey);
        const { data: { user } } = await sb.auth.getUser(token);
        const email = user?.email?.toLowerCase();
        if (!email || !ADMIN_EMAILS.includes(email)) {
          return new NextResponse('Forbidden', { status: 403 });
        }
      } catch {
        return new NextResponse('Forbidden', { status: 403 });
      }
    } else if (!isInternalApiDevUnscopedAllowed()) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/dashboard/:path*', '/upgrade/:path*', '/for-lawyers/:path*', '/api/:path*', '/internal/:path*'],
};
