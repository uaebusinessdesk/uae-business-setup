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
    '/admin/login', // Admin login page (app/admin/login/page.tsx)
    '/_next',      // Next.js internals (static files, etc.)
    '/assets',     // Static assets
  ];

  // Check if pathname matches any allowlisted route
  if (appRouterRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Serve static HTML files for root paths (legacy behavior)
  // If the path doesn't have an extension, try to serve the HTML file
  if (!pathname.includes('.')) {
    const htmlPath = pathname === '/' ? '/index.html' : `${pathname}.html`;
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
