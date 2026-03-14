"use client"

import { useQueryClient } from "@tanstack/react-query"
import { usePullToRefresh } from "@/lib/hooks/use-pull-to-refresh"
import { PullToRefreshIndicator } from "./PullToRefreshIndicator"

interface RefreshableLayoutProps {
  children: React.ReactNode
  /**
   * Override fungsi refresh. Default: invalidate semua query aktif.
   * Berguna kalau halaman tertentu cukup invalidate query spesifik saja.
   */
  onRefresh?: () => Promise<void>
  /** Jarak tarik sebelum trigger refresh (px). Default: 80 */
  threshold?: number
  className?: string
}

/**
 * Wrapper layout yang menambahkan pull-to-refresh pada scrollable area.
 *
 * Gunakan di layout (app) atau per-halaman:
 *
 * ```tsx
 * // app/(app)/layout.tsx
 * export default function AppLayout({ children }) {
 *   return <RefreshableLayout>{children}</RefreshableLayout>
 * }
 * ```
 *
 * Atau di halaman spesifik dengan refresh kustom:
 * ```tsx
 * <RefreshableLayout onRefresh={async () => { await refetchOrders() }}>
 *   <TransaksiList />
 * </RefreshableLayout>
 * ```
 */
export function RefreshableLayout({
  children,
  onRefresh,
  threshold = 80,
  className,
}: RefreshableLayoutProps) {
  const queryClient = useQueryClient()

  const defaultRefresh = async () => {
    // Invalidate semua query yang sedang aktif — TanStack Query refetch otomatis
    await queryClient.invalidateQueries()
  }

  const { indicatorRef, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh({
    threshold,
    onRefresh: onRefresh ?? defaultRefresh,
  })

  return (
    <div className="relative overflow-hidden h-full">
      {/* Indicator tersembunyi di atas, di-animate oleh hook */}
      <PullToRefreshIndicator ref={indicatorRef} />

      {/* Area scroll utama */}
      <div
        className={className ?? "h-full overflow-y-auto overscroll-y-contain"}
        // Mencegah browser native pull-to-refresh (CSS tidak cukup di semua browser)
        style={{ overscrollBehaviorY: "contain" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
