import { type NextRequest, NextResponse } from "next/server";

import { serverSession } from "./lib/auth/server";

const PUBLIC_ROUTES = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Allow public routes without auth
  if (
    pathname === "/" ||
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);

  const session = await serverSession(requestHeaders);

  if (!session.data) {
    return NextResponse.redirect(
      new URL(
        `/auth/login/?redirect=${encodeURIComponent(pathname)}`,
        request.url,
      ),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|[\\w-]+\\.\\w+).*)",
    "/(protected)/:path*",
  ],
};

// const subdomain = extractSubdomain(request);

// if (subdomain) {

//   // ✅ Avoid infinite redirect loop
//   // if (!sessionCookie) {
//   //   if (pathname !== "/auth/login") {
//   //     const mainHost = request.headers
//   //       .get("host")
//   //       ?.replace(`${subdomain}.`, "");
//   //     const loginUrl = new URL("/auth/login", request.url);
//   //     loginUrl.hostname = mainHost || "localhost";

//   //     return NextResponse.redirect(loginUrl);
//   //   }
//   //   return NextResponse.next(); // Let /login page load without auth
//   // }

//   // ✅ Rewrite root "/" to "/u/:subdomain"
//   if (pathname === "/") {
//     return NextResponse.rewrite(new URL(`/u/${subdomain}`, request.url));
//   }
// }

// On the root domain, allow normal access
