import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.appUrl.replace("/dashboard", "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/"], // Disallow app routes and API
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
