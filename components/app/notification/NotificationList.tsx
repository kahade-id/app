"use client"

import * as React from "react"
import { useInView } from "@/lib/hooks/use-in-view"
import { NotificationItem } from "./NotificationItem"
import type { Notification } from "@/types/notification"

interface NotificationListProps {
  notifications: Notification[]
  onMarkRead: (id: string) => void
  hasNext: boolean
  isLoading: boolean
  onLoadMore: () => void
}

export function NotificationList({ notifications, onMarkRead, hasNext, isLoading, onLoadMore }: NotificationListProps) {
  return (
    <>
      {/* #74 — aria-live announces new notifications to screen readers */}
      <div
        className="space-y-2"
        aria-live="polite"
        aria-label="Daftar notifikasi"
        aria-atomic="false"
        aria-relevant="additions"
      >
        {notifications.map((notif) => (
          <NotificationItem key={notif.id} notification={notif} onMarkRead={onMarkRead} />
        ))}
      </div>
      {hasNext && (
        <LoadMoreTrigger isLoading={isLoading} onLoadMore={onLoadMore} />
      )}
    </>
  )
}

function LoadMoreTrigger({ isLoading, onLoadMore }: { isLoading: boolean; onLoadMore: () => void }) {
  const { ref, inView } = useInView({ rootMargin: "200px" })
  const loadedRef = React.useRef(false)
  const onLoadMoreRef = React.useRef(onLoadMore)
  onLoadMoreRef.current = onLoadMore

  // BUG-M02 FIX: Track previous isLoading so we can reset loadedRef when a load
  // completes while the sentinel is still in view. Without this, on short screens
  // where the sentinel never leaves the viewport, loadedRef stays true after the
  // first trigger and no subsequent pages are ever loaded.
  const prevLoadingRef = React.useRef(false)

  React.useEffect(() => {
    // When loading just finished while still in view, allow the next trigger.
    if (prevLoadingRef.current && !isLoading && inView) {
      loadedRef.current = false
    }
    prevLoadingRef.current = isLoading

    if (inView && !isLoading && !loadedRef.current) {
      loadedRef.current = true
      onLoadMoreRef.current()
    }

    if (!inView) {
      loadedRef.current = false
    }
  }, [inView, isLoading])

  return (
    <div ref={ref} className="flex justify-center py-4" aria-hidden={!isLoading}>
      {isLoading && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Memuat notifikasi...
        </p>
      )}
    </div>
  )
}
