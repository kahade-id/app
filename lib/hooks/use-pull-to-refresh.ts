"use client"

import { useRef, useCallback } from "react"

interface UsePullToRefreshOptions {
  /** Fungsi async yang dipanggil saat pull berhasil trigger refresh */
  onRefresh: () => Promise<void>
  /** Jarak tarik (px) sebelum refresh ter-trigger. Default: 80 */
  threshold?: number
  /** Maksimal jarak tarik yang divisualisasikan. Default: 120 */
  maxPull?: number
}

export interface PullToRefreshHandlers {
  indicatorRef: React.RefObject<HTMLDivElement | null>
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
}

/**
 * Hook pull-to-refresh kustom.
 *
 * Cara pakai:
 * ```tsx
 * const { indicatorRef, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh({
 *   onRefresh: async () => { await queryClient.invalidateQueries() }
 * })
 *
 * return (
 *   <div className="relative overflow-hidden h-dvh">
 *     <PullToRefreshIndicator ref={indicatorRef} />
 *     <div
 *       className="h-full overflow-y-auto overscroll-y-contain"
 *       onTouchStart={onTouchStart}
 *       onTouchMove={onTouchMove}
 *       onTouchEnd={onTouchEnd}
 *     >
 *       {children}
 *     </div>
 *   </div>
 * )
 * ```
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPull = 120,
}: UsePullToRefreshOptions): PullToRefreshHandlers {
  const indicatorRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const pulling = useRef(false)
  const pullDistance = useRef(0)
  const isRefreshing = useRef(false)

  // ── Update posisi & state visual indicator ──────────────────────────────────
  const setIndicator = useCallback(
    (distance: number, refreshing = false) => {
      const el = indicatorRef.current
      if (!el) return

      if (refreshing) {
        // Mode spinning — indicator berhenti di bawah threshold
        el.style.transform = `translateY(${threshold * 0.6}px)`
        el.style.opacity = "1"
        el.setAttribute("data-refreshing", "true")
        return
      }

      if (distance <= 0) {
        // Sembunyikan
        el.style.transform = "translateY(-56px)"
        el.style.opacity = "0"
        el.removeAttribute("data-refreshing")
        return
      }

      // Tarik perlahan dengan rubber-band effect
      const clamped = Math.min(distance, maxPull)
      const rubber = clamped * (1 - clamped / (maxPull * 2)) // melambat di ujung
      const progress = Math.min(distance / threshold, 1)

      el.style.transform = `translateY(${rubber - 56}px)`
      el.style.opacity = String(progress)
      el.removeAttribute("data-refreshing")
    },
    [threshold, maxPull]
  )

  // ── Touch handlers ──────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (isRefreshing.current) return
    startY.current = e.touches[0].clientY
    pulling.current = true
    pullDistance.current = 0
  }, [])

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling.current || isRefreshing.current) return

      // Hanya trigger jika scroll area sudah di paling atas
      const scrollEl = e.currentTarget as HTMLElement
      if (scrollEl.scrollTop > 0) {
        pulling.current = false
        return
      }

      const delta = e.touches[0].clientY - startY.current
      if (delta <= 0) return // abaikan scroll ke atas

      pullDistance.current = delta
      setIndicator(delta)
    },
    [setIndicator]
  )

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return
    pulling.current = false

    if (pullDistance.current >= threshold && !isRefreshing.current) {
      isRefreshing.current = true
      setIndicator(threshold, true) // tampilkan spinner

      try {
        await onRefresh()
      } finally {
        // Animasi selesai → sembunyikan indicator
        setTimeout(() => {
          isRefreshing.current = false
          setIndicator(0)
        }, 350)
      }
    } else {
      // Tidak cukup jauh → spring kembali
      setIndicator(0)
    }

    pullDistance.current = 0
  }, [threshold, onRefresh, setIndicator])

  return { indicatorRef, onTouchStart, onTouchMove, onTouchEnd }
}
