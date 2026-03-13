"use client"

import * as React from "react"
import { Checks } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { LoadingState, ErrorState, PageHeader, PageTransition, ConfirmDialog } from "@/components/shared"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/lib/hooks/use-notifications"
import { NotificationList } from "@/components/app/notification/NotificationList"
import { NotificationEmpty } from "@/components/app/notification/NotificationEmpty"
import type { Notification } from "@/types/notification"

export default function NotifikasiPage() {
  usePageTitle("Notifikasi")
  const [confirmMarkAllOpen, setConfirmMarkAllOpen] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [allNotifications, setAllNotifications] = React.useState<Notification[]>([])
  const { data, isLoading, isError, refetch } = useNotifications({ page, limit: 20 })
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  React.useEffect(() => {
    if (data?.data) {
      setAllNotifications((prev) => {
        if (page === 1) return data.data
        const updatedMap = new Map(prev.map((n) => [n.id, n]))
        for (const item of data.data) {
          updatedMap.set(item.id, item)
        }
        return Array.from(updatedMap.values())
      })
    }
  }, [data, page])

  if (isLoading && page === 1) return <LoadingState fullPage text="Memuat notifikasi..." />
  if (isError) return <ErrorState title="Gagal Memuat Notifikasi" onRetry={() => refetch()} />

  const notifications = allNotifications

  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title="Notifikasi"
        description="Semua notifikasi Anda"
        action={
          notifications.length > 0 ? (
            <Button variant="outline" size="sm" onClick={() => setConfirmMarkAllOpen(true)} disabled={markAllRead.isPending} data-testid="button-mark-all-read">
              <Checks className="mr-2 size-4" />
              Tandai Semua Dibaca
            </Button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <NotificationEmpty />
      ) : (
        <NotificationList
          notifications={notifications}
          onMarkRead={React.useCallback((id: string) => markRead.mutate(id), [markRead])}
          hasNext={!!(data && data.hasNext)}
          isLoading={isLoading}
          onLoadMore={() => setPage((p) => p + 1)}
        />
      )}

      {/* #279 — Confirmation before bulk mark-all-read */}
      {/* JSX-001 FIX: Moved ConfirmDialog inside <PageTransition> and removed the stray
          </PageTransition> that previously appeared between the notification list and the
          dialog. The old code had two </PageTransition> closing tags but only one opening
          tag — invalid JSX that caused a compile error. Dialogs use a portal so mounting
          them inside PageTransition does not affect their visual positioning. */}
      <ConfirmDialog
        open={confirmMarkAllOpen}
        onOpenChange={setConfirmMarkAllOpen}
        title="Tandai Semua Dibaca?"
        description="Semua notifikasi akan ditandai sebagai sudah dibaca. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Tandai Semua"
        onConfirm={() => { markAllRead.mutate(); setConfirmMarkAllOpen(false) }}
      />
    </PageTransition>
  )
}
