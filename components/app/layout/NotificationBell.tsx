"use client"

import { useCallback } from "react"
import { Bell } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useUnreadNotificationCount } from "@/lib/hooks/use-notifications"
import { ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

// #231 — Moved to local component state; does not need global store for UI-only badge count
export function NotificationBell() {
  const router = useRouter()
  const { data: unreadCount = 0 } = useUnreadNotificationCount()

  const handleClick = useCallback(
    () => router.push(ROUTES.NOTIFICATIONS),
    [router]
  )

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={handleClick}
      aria-label={`Notifikasi${unreadCount > 0 ? ` — ${unreadCount} belum dibaca` : ""}`}
      data-testid="button-notification-bell"
    >
      <Bell className="size-5" aria-hidden="true" />
      {unreadCount > 0 && (
        <>
          {/* #63 — Badge is presentational; aria-label on button carries the count */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold min-w-[18px] h-[18px] px-1"
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
          {/* #74 — Live region announces count changes to screen readers */}
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {unreadCount} notifikasi belum dibaca
          </span>
        </>
      )}
    </Button>
  )
}
