import { format, formatDistance, formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { id } from 'date-fns/locale'
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'

// #297 — Default to WIB (Indonesia Western Time) for all display
const DEFAULT_TIMEZONE = 'Asia/Jakarta'

function parseDate(date: string | Date): Date {
  const d = typeof date === 'string' ? parseISO(date) : date
  return d
}

export function formatDate(date: string | Date, fmt = 'dd MMM yyyy', timezone = DEFAULT_TIMEZONE): string {
  const d = parseDate(date)
  if (!isValid(d)) return '-'
  try {
    return formatInTimeZone(d, timezone, fmt, { locale: id })
  } catch {
    return format(d, fmt, { locale: id })
  }
}

export function formatDateTime(date: string | Date, timezone = DEFAULT_TIMEZONE): string {
  return formatDate(date, 'dd MMM yyyy, HH:mm', timezone)
}

export function formatRelative(date: string | Date): string {
  const d = parseDate(date)
  if (!isValid(d)) return '-'
  // L-18 FIX: formatDistanceToNow uses the local browser timezone by default,
  // which is inconsistent with formatDate/formatDateTime that explicitly use WIB.
  // Convert to WIB zone before computing relative distance so all date display
  // in the app is consistently anchored to Asia/Jakarta time.
  try {
    const zonedD = toZonedTime(d, DEFAULT_TIMEZONE)
    const zonedNow = toZonedTime(new Date(), DEFAULT_TIMEZONE)
    // FIX: formatDistanceToNow does not accept a baseDate option (excess-property TS error).
    // Use formatDistance(from, to, options) to anchor "now" to the WIB-zoned current time.
    return formatDistance(zonedD, zonedNow, { addSuffix: true, locale: id })
  } catch {
    // Fallback to unzoned if toZonedTime fails (e.g. invalid timezone env)
    return formatDistanceToNow(d, { addSuffix: true, locale: id })
  }
}

export function formatDateTimeWIB(date: string | Date): string {
  return formatDate(date, "dd MMM yyyy, HH:mm 'WIB'", DEFAULT_TIMEZONE)
}

export function formatDateTimeWithZone(date: string | Date, timezone = DEFAULT_TIMEZONE): string {
  const d = parseDate(date)
  if (!isValid(d)) return '-'
  try {
    const zonedDate = toZonedTime(d, timezone)
    const zoneAbbr = timezone === 'Asia/Jakarta' ? 'WIB'
      : timezone === 'Asia/Makassar' ? 'WITA'
      : timezone === 'Asia/Jayapura' ? 'WIT'
      : ''
    return format(zonedDate, `dd MMM yyyy, HH:mm '${zoneAbbr}'`, { locale: id })
  } catch {
    return formatDateTime(date)
  }
}

export function isExpired(date: string | Date): boolean {
  const d = parseDate(date)
  return isValid(d) && d < new Date()
}

export function getTimeRemaining(deadline: string | Date): string {
  const d = parseDate(deadline)
  if (!isValid(d)) return '-'
  if (d < new Date()) return 'Sudah berakhir'
  return formatDistanceToNow(d, { locale: id })
}
