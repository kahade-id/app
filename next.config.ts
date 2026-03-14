import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

// CDN/storage domain for user content (avatars, KYC photos, etc.)
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL ?? ''

// #18 FIX: Gunakan helper safe agar `new URL(CDN_URL)` tidak throw saat CDN_URL kosong
// atau berisi string tidak valid (misal env var belum di-set saat build CI)
function parseCdnHostname(url: string): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname || null
  } catch {
    console.warn('[next.config] NEXT_PUBLIC_CDN_URL tidak valid, image optimization untuk CDN dinonaktifkan:', url)
    return null
  }
}

const cdnHostname = parseCdnHostname(CDN_URL)

// SEC-005 FIX: Restrict WebSocket to specific API domain instead of wildcard wss:/ws:
// which would allow connections to any origin.
const WS_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace(/^http/, 'ws')
  : ''

// C-05 FIX: Use parsed cdnHostname (not raw CDN_URL) in img-src so env vars
// with trailing slashes, paths, or special characters cannot break/bypass CSP.
const cdnImgSrc = cdnHostname ? `https://${cdnHostname}` : ''

// H-08 FIX: Added report-uri so CSP violations are logged for visibility.
// Replace /api/csp-report with your actual reporting endpoint.
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: ${cdnImgSrc};
  font-src 'self';
  connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'} ${WS_URL ? `${WS_URL} ${WS_URL.replace(/^ws:/, 'wss:')}` : ''};
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  report-uri /api/csp-report;
`.replace(/\n/g, ' ')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // #050 FIX: Removed images: { unoptimized: true }.
  // Re-enable Next.js image optimization (WebP conversion, lazy loading, CDN sizing).
  // Configure remotePatterns for external image domains.
  images: {
    remotePatterns: cdnHostname
      ? [{ protocol: 'https', hostname: cdnHostname }]
      : [],
  },
  trailingSlash: false,
  // #049 FIX: Set ignoreDuringBuilds: false so ESLint errors block production builds.
  // This ensures security linting rules (no-eval, no-script-url, etc.) are enforced.
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  // #098 FIX: Production never allows Replit scaffolding origins (isDev guard).
  // Dev mode includes Replit preview domains so the webview can reach the HMR server;
  // these are intentionally allowed only in development for Replit compatibility.
  // Replit dev preview uses a deep-subdomain format: {id}.{cluster}.replit.dev
  // Use wildcard patterns to cover all cluster variants (sisko, janeway, etc.)
  allowedDevOrigins: isDev
    ? ['localhost', '127.0.0.1', '*.replit.dev', '*.*.replit.dev', '*.repl.co', '*.replit.app']
    : [],
  // M-14 FIX: @kahade/shared is NOT an npm package — it is a local folder (./shared/)
  // imported via tsconfig path aliases (@/*: [./*]). Next.js transpiles local files
  // automatically; adding them to transpilePackages would cause a module-not-found
  // error because no @kahade/shared exists in node_modules. Removed entirely.
  // #21 FIX: Ganti file /dashboard/page.tsx yang hanya berisi redirect('/') dengan
  // permanent redirect di next.config.ts agar tidak ada build artifact yang terbuang.
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // SEC-003 FIX: Removed "preload" flag — it permanently registers the domain
          // in browser preload lists and cannot be undone. Only add when domain is
          // confirmed production-ready with HTTPS forever.
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
