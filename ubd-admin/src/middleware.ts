import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const authCookie = request.cookies.get('ubd-auth')?.value;

    if (authCookie !== 'authenticated') {
      // Redirect to admin login if not authenticated
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // Allowlist: Routes that should bypass HTML rewriting and go to Next.js App Router
  // These routes exist as app directory routes (page.tsx files) and must not be rewritten to .html
  const appRouterRoutes = [
    '/api',        // API routes
    '/quote',      // Public quote view/decision pages (app/quote/*)
    '/invoice',    // Public invoice view pages (app/invoice/*)
    '/admin',      // Admin pages (app/admin/*)
    '/_next',      // Next.js internals (static files, etc.)
    '/assets',     // Static assets
  ];

  // Check if pathname matches any allowlisted route OR is the root path
  // Root path should be handled by app/page.tsx, not rewritten to index.html
  if (pathname === '/' || appRouterRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Serve static HTML files for other paths (legacy behavior)
  // Only rewrite paths that don't have an extension and aren't root or app router routes
  if (!pathname.includes('.')) {
    const htmlPath = `${pathname}.html`;
    return NextResponse.rewrite(new URL(htmlPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
