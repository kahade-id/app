"use client"

import { useEffect } from "react"

// L-14 NOTE: This hook only updates document.title client-side via useEffect.
// It has NO effect on the <title> in server-rendered HTML, so search engines and
// social media crawlers (OG/Twitter cards) will not see per-page titles from this hook.
// For the dashboard app this is intentional — it is an authenticated app where SEO
// is not a priority (robots.txt disallows all crawlers).
// If SSR titles are ever needed, use Next.js Metadata API instead:
//   export const metadata: Metadata = { title: 'Page Title — Kahade' }
// or generateMetadata() for dynamic titles.
export function usePageTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = `${title} — Kahade`
    return () => {
      document.title = previousTitle
    }
  }, [title])
}
