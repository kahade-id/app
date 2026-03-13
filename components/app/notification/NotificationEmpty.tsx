"use client"

import { Bell } from "@phosphor-icons/react"
import { EmptyState } from "@/components/shared"

export function NotificationEmpty() {
  return (
    <EmptyState
      title="Tidak Ada Notifikasi"
      description="Anda belum memiliki notifikasi."
      icon={<Bell className="size-8" />}
    />
  )
}
