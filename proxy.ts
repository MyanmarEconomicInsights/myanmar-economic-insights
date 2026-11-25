import { NextResponse, type NextRequest } from 'next/server';

/**
 * Burmese version (Beta): /my and /my/... are served by the same pages.
 * The URL is rewritten without /my, and the header x-mei-lang: my tells the pages to use Burmese.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const headers = new Headers(req.headers);
  if (pathname === '/my' || pathname.startsWith('/my/')) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    headers.set('x-mei-lang', 'my');
    return NextResponse.rewrite(url, { request: { headers } });
  }
  headers.delete('x-mei-lang');
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/|api/|_vercel/|icon\\.svg|favicon\\.ico|robots\\.txt).*)'],
};
