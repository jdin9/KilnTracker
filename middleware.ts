import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';
  const proto = request.headers.get('x-forwarded-proto');

  if (isProduction && proto && proto !== 'https') {
    const url = request.nextUrl;
    url.protocol = 'https';
    return NextResponse.redirect(url, { status: 307 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
