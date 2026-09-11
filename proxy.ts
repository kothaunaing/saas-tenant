import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge proxy for the Tenant Dashboard (saas-tenant).
 *
 * Uses `tenant_access_token` — the role-scoped cookie set exclusively
 * when a TENANT_ADMIN role logs in. A customer or provider session cookie
 * will NOT grant access here.
 *
 * All routes except /login are protected.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = Boolean(
    request.cookies.get('tenant_access_token')?.value,
  );

  // Unauthenticated on any protected route → /login
  if (pathname !== '/login' && !authenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already authenticated on /login → dashboard root
  if (pathname === '/login' && authenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.svg).*)'],
};
