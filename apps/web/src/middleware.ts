import { type NextRequest, NextResponse } from "next/server";

import { rootDomain } from "@/lib/utils";

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // Local development environment
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch?.length) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
    if (hostname.includes(".localhost")) {
      return hostname.split(".")[0];
    }

    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(":")[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const parts = hostname.split("---");
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, "") : null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  if (subdomain) {
    // ✅ Avoid infinite redirect loop
    // if (!sessionCookie) {
    //   if (pathname !== "/auth/login") {
    //     const mainHost = request.headers
    //       .get("host")
    //       ?.replace(`${subdomain}.`, "");
    //     const loginUrl = new URL("/auth/login", request.url);
    //     loginUrl.hostname = mainHost || "localhost";

    //     return NextResponse.redirect(loginUrl);
    //   }
    //   return NextResponse.next(); // Let /login page load without auth
    // }

    // ✅ Rewrite root "/" to "/u/:subdomain"
    if (pathname === "/") {
      return NextResponse.rewrite(new URL(`/u/${subdomain}`, request.url));
    }
  }

  // On the root domain, allow normal access
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
    // "/(protected)/:path*",
    "/auth/:path*",
  ],
};
