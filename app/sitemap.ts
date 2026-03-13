import type { MetadataRoute } from "next";

// Intentionally minimal sitemap: this is an auth-required app,
// so only public-facing auth pages are listed for crawlers.
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.kahade.id";

  // #035 FIX: Removed root URL (baseUrl) from sitemap.
  // The root of app.kahade.id is the authenticated dashboard — crawlers would only
  // get a redirect to /login, wasting crawl budget and confusing search engines.
  return [
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 1.0 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}
