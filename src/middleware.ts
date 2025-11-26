import { NextRequest, NextResponse } from "next/server";

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
  const url = req.nextUrl;
  const hostname = req.headers.get("host")!;

  // Define the domains
  // Adjust these based on your actual Vercel domains
  const appDomain = "app.simupa.web.id";
  const landingDomain = "simupa.web.id";

  // Check if we are on the app subdomain
  // Also handle localhost for testing: app.localhost:3000
  const isAppSubdomain = hostname === appDomain || hostname.startsWith("app.");

  if (isAppSubdomain) {
    // Rewrite to the /app folder
    // Preserve the path (e.g. /dashboard -> /app/dashboard)
    // But since our app is mainly at /app/page.tsx (which is /app route),
    // and we moved page.tsx to /app/app/page.tsx, the route is effectively /app.
    // Wait, if we moved src/app/page.tsx to src/app/app/page.tsx,
    // then the route /app corresponds to that page.
    // So we rewrite the root path "/" to "/app".
    
    // If the path is just "/", rewrite to "/app"
    if (url.pathname === "/") {
      return NextResponse.rewrite(new URL("/app", req.url));
    }
    
    // If the path is anything else, we might need to handle it.
    // But currently the app is single page mostly.
    // If there are other routes inside /app/app/..., they would be /app/...
    // So we rewrite /path to /app/path
    return NextResponse.rewrite(new URL(`/app${url.pathname}`, req.url));
  }

  // If we are on the landing domain (or any other domain), serve the root content
  // which is now the Landing Page (src/app/page.tsx)
  return NextResponse.next();
}
