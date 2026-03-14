"use client"

import { useQueryClient } from "@tanstack/react-query"
import { usePullToRefresh } from "@/lib/hooks/use-pull-to-refresh"
import { PullToRefreshIndicator } from "./PullToRefreshIndicator"

interface RefreshableLayoutProps {
  children: React.ReactNode
  onRefresh?: () => Promise<void>
  threshold?: number
  className?: string
}

export function RefreshableLayout({
  children,
  onRefresh,
  threshold = 80,
  className,
}: RefreshableLayoutProps) {
  const queryClient = useQueryClient()

  const defaultRefresh = async () => {
    await queryClient.invalidateQueries()
  }

  const { indicatorRef, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh({
    threshold,
    onRefresh: onRefresh ?? defaultRefresh,
  })

  return (
    // FIX: flex flex-col supaya inner div bisa pakai flex-1 untuk mengisi sisa tinggi
    // Sebelumnya block div biasa — flex-1 dari className tidak punya efek → tidak bisa scroll
    <div className="relative overflow-hidden h-full flex flex-col">
      <PullToRefreshIndicator ref={indicatorRef} />

      <div
        className={className ?? "flex-1 overflow-y-auto overscroll-y-contain"}
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
