import { NextRequest, NextResponse } from "next/server";

import { DEFAULT_STUDIO_PASSWORD, SITE_ACCESS_COOKIE, STUDIO_PASSWORD_COOKIE } from "@/lib/studioStorage";

const PUBLIC_PATHS = ["/access", "/_next", "/api", "/favicon.ico", "/preview"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublicPath) {
    return NextResponse.next();
  }

  const expectedCode = request.cookies.get(STUDIO_PASSWORD_COOKIE)?.value ?? DEFAULT_STUDIO_PASSWORD;
  const providedCode = request.cookies.get(SITE_ACCESS_COOKIE)?.value ?? null;

  if (providedCode !== expectedCode) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/access";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|api|access|preview).*)",
};
