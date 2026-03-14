import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_ROUTES, PUBLIC_ROUTES } from '@/lib/route-constants'

// C-03 NOTE: Edge runtime cannot run Node.js crypto (e.g. jsonwebtoken) so signature
// verification is not possible here. This function only checks the exp claim as a
// fast-path UX guard — it is NOT a security boundary. Real authorization must be
// enforced on the API server for every protected request.
// The authoritative check is: API returns 401 → interceptor refreshes or logs out.
//
// Hardening applied:
//  1. Validates JWT structure (3 parts)
//  2. Validates payload is an object (not array/null)
//  3. Validates exp is a finite positive number before trusting it
//  4. 30-second clock-skew buffer (increased from 10s)
function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true

    // Base64url decode payload — edge runtime safe (no atob everywhere)
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))

    // Ensure payload is a plain object
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return true

    // If there's no exp claim, treat token as not expired (server enforces expiry)
    if (!payload.exp) return false

    // Validate exp is a finite positive number before trusting it
    const exp = Number(payload.exp)
    if (!Number.isFinite(exp) || exp <= 0) return true

    // 30-second buffer for clock skew tolerance
    return Date.now() / 1000 > exp - 30
  } catch {
    return true
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get('access_token')?.value

  const isAuthRoute = AUTH_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))

  // Rute publik (onboarding, dll) — tidak butuh autentikasi, tidak redirect ke home
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))
  if (isPublicRoute) {
    return NextResponse.next()
  }

  if (isAuthRoute) {
    // Jika ada token dan belum expired, redirect ke dashboard baru
    if (accessToken && !isJwtExpired(accessToken)) {
      return NextResponse.redirect(new URL('/beranda', request.url))
    }
    return NextResponse.next()
  }

  // #20 FIX: Redirect ke login jika token tidak ada ATAU sudah expired
  if (!accessToken || isJwtExpired(accessToken)) {
    const loginUrl = new URL('/login', request.url)
    const fullRedirect = pathname + request.nextUrl.search
    // Simpan deep link — kecuali kalau dari root (splash) atau beranda
    const isDeepLink = pathname !== '/' && pathname !== '/beranda'
    if (isDeepLink) {
      const isValidRedirect =
        fullRedirect.startsWith('/') &&
        !fullRedirect.startsWith('//') &&
        !fullRedirect.includes('://') &&
        !fullRedirect.includes('@')
      if (isValidRedirect) {
        loginUrl.searchParams.set('redirect', fullRedirect)
      }
    }
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * C-15 FIX: Exclude all static file types, not just .png and .svg.
     * This prevents middleware from running on images, fonts, documents, etc.
     * and avoids accidental redirects to login for public assets.
     */
    '/((?!api|_next/static|_next/image|favicon\\.svg|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|mp4|webm|mp3|wav|pdf|woff|woff2|ttf|otf|eot)$).*)',
  ],
}
