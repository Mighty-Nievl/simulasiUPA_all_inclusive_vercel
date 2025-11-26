import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { env } from "@/lib/env";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  // 1. Refresh Supabase session first
  const response = await updateSession(req);
  
  const url = req.nextUrl;
  const hostname = req.headers.get("host")!;
  const pathname = url.pathname;

  // Define domains
  const rootDomain = env.NEXT_PUBLIC_ROOT_DOMAIN;
  const appDomain = env.NEXT_PUBLIC_APP_DOMAIN;

  const isAppSubdomain = hostname === appDomain || hostname.startsWith("app.");

  // -----------------------------------------------------------------------------
  // Handle App Subdomain (app.localhost or app.simupa.web.id)
  // -----------------------------------------------------------------------------
  if (isAppSubdomain) {
    // 0. Redirect login/register to root domain
    if (pathname === "/login" || pathname === "/daftar") {
      return NextResponse.redirect(new URL(pathname, `https://${rootDomain}`));
    }

    // 1. Root path -> rewrite to /dashboard
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/dashboard", req.url));
    }

    // 2. Special files to ignore
    if (pathname === "/icon") {
      return NextResponse.next();
    }
    
    // 3. Prevent recursive rewriting if path already starts with /dashboard
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.next();
    }
    
    // 4. Default: Rewrite everything else to /dashboard/...
    return NextResponse.rewrite(new URL(`/dashboard${pathname}`, req.url));
  }

  // -----------------------------------------------------------------------------
  // Handle Root Domain (Landing Page, Login, Register)
  // -----------------------------------------------------------------------------
  // No special rewrites needed for root domain as /login and /daftar are standard paths
  
  return response;
}
