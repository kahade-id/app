"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

/**
 * Intercept F5 / Ctrl+R / Cmd+R di desktop.
 *
 * Mengganti hard refresh browser dengan soft refresh TanStack Query
 * (invalidate semua query aktif) sehingga halaman tidak reload penuh.
 *
 * Pasang di layout utama:
 * ```tsx
 * // app/(app)/layout.tsx atau AppShell.tsx
 * export function AppShell({ children }) {
 *   useInterceptKeyboardRefresh()
 *   return <main>{children}</main>
 * }
 * ```
 *
 * Catatan: Ini hanya berlaku saat focus di dalam window aplikasi.
 * Browser-level shortcuts yang dipicu dari luar window tidak bisa dicegah.
 */
export function useInterceptKeyboardRefresh() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isRefresh =
        e.key === "F5" ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r")

      if (!isRefresh) return

      // Hanya intercept jika user tidak sedang di form / input
      // supaya Ctrl+R di field pencarian tidak terganggu
      const tag = (document.activeElement?.tagName ?? "").toLowerCase()
      if (tag === "input" || tag === "textarea" || tag === "select") return

      e.preventDefault()

      // Soft refresh — invalidate semua query, data refetch di background
      queryClient.invalidateQueries()
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [queryClient])
}
