/**
 * C-17: SSR-safe sessionStorage wrapper.
 *
 * Problem: Accessing sessionStorage directly throws during SSR (server-side rendering)
 * because `window` / `sessionStorage` do not exist in Node.js.
 * Scattering `if (typeof window !== 'undefined')` checks across the codebase is fragile
 * and easy to miss in future updates.
 *
 * Solution: Centralise all sessionStorage access through this module.
 * Every method silently no-ops on the server and logs errors on the client
 * instead of throwing, making SSR and client rendering fully safe.
 */

function isClient(): boolean {
  return typeof window !== 'undefined'
}

export const safeSessionStorage = {
  getItem(key: string): string | null {
    if (!isClient()) return null
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  },

  setItem(key: string, value: string): void {
    if (!isClient()) return
    try {
      sessionStorage.setItem(key, value)
    } catch (error) {
      console.error(`[safeSessionStorage] Failed to set "${key}":`, error)
    }
  },

  removeItem(key: string): void {
    if (!isClient()) return
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error(`[safeSessionStorage] Failed to remove "${key}":`, error)
    }
  },

  // #058/#075 FIX: Added clear() method.
  // Allows callers to flush all session storage in one call (e.g. on logout),
  // preventing stale keys from persisting across sessions.
  clear(): void {
    if (!isClient()) return
    try {
      sessionStorage.clear()
    } catch (error) {
      console.error('[safeSessionStorage] Failed to clear storage:', error)
    }
  },
}
