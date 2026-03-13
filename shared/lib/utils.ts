import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// #199/#171 — Sanitize URLs to prevent javascript: protocol XSS attacks
const ALLOWED_URL_PROTOCOLS = ['https:', 'http:', 'mailto:']

export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '#'
  try {
    const parsed = new URL(url)
    if (!ALLOWED_URL_PROTOCOLS.includes(parsed.protocol)) {
      return '#'
    }
    return url
  } catch {
    // Relative URLs are fine
    if (url.startsWith('/')) return url
    return '#'
  }
}
