import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.kahade.id";

export default function robots(): MetadataRoute.Robots {
  // L-9 NOTE: disallow: "/" is intentional for the dashboard app (app.kahade.id).
  // This is an authenticated application — there is no public-facing SEO content here.
  // Only auth pages (/login, /register) are allowed for crawlers so users can find
  // the sign-in page via search engines. The landing page (kahade.id) handles SEO.
  // If public profile pages (e.g. /user/[username]) are added in future, add them here.
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/login", "/register"],
        disallow: ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
