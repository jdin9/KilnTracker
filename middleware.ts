import { NextRequest, NextResponse } from "next/server";

import { DEFAULT_STUDIO_PASSWORD, SITE_ACCESS_COOKIE, STUDIO_PASSWORD_COOKIE } from "@/lib/studioStorage";

const PUBLIC_PATHS = ["/access", "/_next", "/favicon.ico", "/preview"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublicPath || !pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const expectedCode = request.cookies.get(STUDIO_PASSWORD_COOKIE)?.value ?? DEFAULT_STUDIO_PASSWORD;
  const providedCode = request.cookies.get(SITE_ACCESS_COOKIE)?.value ?? null;

  if (providedCode !== expectedCode) {
    return NextResponse.json({ error: "Studio access code required" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
