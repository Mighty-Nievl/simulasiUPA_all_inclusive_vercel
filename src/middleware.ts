import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

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
  // Define domains
  let rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";
  // Remove protocol if present in rootDomain (just in case user added http://)
  rootDomain = rootDomain.replace(/^https?:\/\//, '');

  let appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;
  if (!appDomain && process.env.NEXT_PUBLIC_APP_URL) {
    try {
      const tempUrl = new URL(process.env.NEXT_PUBLIC_APP_URL.startsWith('http') ? process.env.NEXT_PUBLIC_APP_URL : `https://${process.env.NEXT_PUBLIC_APP_URL}`);
      appDomain = tempUrl.hostname;
    } catch (e) {
      // ignore invalid url
    }
  }
  if (!appDomain) {
    appDomain = `app.${rootDomain}`;
  }

  const isAppSubdomain = hostname === appDomain || hostname.startsWith("app.");

  // -----------------------------------------------------------------------------
  // Handle App Subdomain (app.localhost or app.simupa.web.id)
  // -----------------------------------------------------------------------------
  if (isAppSubdomain) {
    // 1. Root path -> rewrite to /app
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/app", req.url));
    }

    // 2. Special files to ignore
    if (pathname === "/icon") {
      return NextResponse.next();
    }
    
    // 3. Prevent recursive rewriting if path already starts with /app
    if (pathname.startsWith("/app")) {
      return NextResponse.next();
    }
    
    // 4. Default: Rewrite everything else to /app/...
    return NextResponse.rewrite(new URL(`/app${pathname}`, req.url));
  }

  // -----------------------------------------------------------------------------
  // Handle Root Domain (Landing Page, Login, Register)
  // -----------------------------------------------------------------------------
  // No special rewrites needed for root domain as /login and /daftar are standard paths
  
  return response;
}
