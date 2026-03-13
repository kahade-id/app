// #296 — Locale-aware currency formatting with SSR-safe Intl usage

interface FormatIDROptions {
  compact?: boolean
  withRp?: boolean
  /** Override locale (default: 'id-ID') */
  locale?: string
}

// Memoize Intl.NumberFormat instances to avoid re-creation per call (#58)
// L-17 FIX: Added max cache size (32 entries) to prevent unbounded Map growth.
// Each unique locale×currency combination adds one entry — in a long-running session
// with many locales this would grow forever. 32 slots covers all realistic combinations.
const MAX_FORMATTER_CACHE = 32
const formatters = new Map<string, Intl.NumberFormat>()

function getFormatter(locale: string, currency: boolean): Intl.NumberFormat {
  const key = `${locale}:${currency}`
  if (!formatters.has(key)) {
    if (formatters.size >= MAX_FORMATTER_CACHE) {
      // Evict the oldest entry (first inserted)
      const firstKey = formatters.keys().next().value
      if (firstKey !== undefined) formatters.delete(firstKey)
    }
    formatters.set(
      key,
      new Intl.NumberFormat(locale, {
        style: currency ? 'currency' : 'decimal',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    )
  }
  return formatters.get(key)!
}

export function formatIDR(amount: number, opts?: FormatIDROptions): string {
  const { compact = false, withRp = true, locale = 'id-ID' } = opts ?? {}

  if (!isFinite(amount)) return withRp ? 'Rp 0' : '0'

  // M-03 FIX: Handle negative values correctly in compact mode
  if (compact) {
    const abs = Math.abs(amount)
    const sign = amount < 0 ? '-' : ''
    const prefix = withRp ? 'Rp ' : ''
    // #15 FIX: Di Indonesia, konvensi suffix kompak:
    // - "rb" = ribu (×1.000)
    // - "jt" = juta (×1.000.000)
    // - "M" = miliar (×1.000.000.000) — bukan "T" yang berarti triliun
    // - "T" = triliun (×1.000.000.000.000) — hanya untuk nilai >= 1 triliun
    if (abs >= 1_000_000_000_000) return `${sign}${prefix}${(abs / 1_000_000_000_000).toFixed(1)}T`
    if (abs >= 1_000_000_000) return `${sign}${prefix}${(abs / 1_000_000_000).toFixed(1)}M`
    if (abs >= 1_000_000) return `${sign}${prefix}${(abs / 1_000_000).toFixed(1)}jt`
    if (abs >= 1_000) return `${sign}${prefix}${(abs / 1_000).toFixed(0)}rb`
  }

  return getFormatter(locale, withRp).format(amount)
}

// Parse IDR string to number: "Rp 50.000" → 50000
export function parseIDR(value: string): number {
  return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
}

// Format for input display: 50000 → "50.000"
export function formatIDRInput(amount: number, locale = 'id-ID'): string {
  return new Intl.NumberFormat(locale).format(amount)
}
