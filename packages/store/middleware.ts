import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)'
  ]
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.peasy.store, demo.localhost:3000)
  let hostname = req.headers
    .get('x-forwarded-host')!
    .replace('.localhost:3000', `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);

  const shop = hostname.split('.')[0];
  const searchParams = req.nextUrl.searchParams.toString();
  // Get the pathname of the request (e.g. /, /about, /products/product-foo)
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

  // rewrite everything else to `/[shop]/[path] dynamic route
  return NextResponse.rewrite(new URL(`/${shop}${path}`, req.url));
}
