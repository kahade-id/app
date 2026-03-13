"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { Bell, ShoppingCart, Wallet, Shield, ChatCircle, Scales, Star, Gift, Crown, Megaphone, Gear } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { formatRelative } from "@/lib/date"
import type { Notification } from "@/types/notification"
import type { ElementType } from "react"

// #49/#43 — Pure presentational component: wrap with React.memo to prevent
// re-renders when parent (notification list) updates unrelated state
function getNotificationIcon(type: string): ElementType {
  if (type.startsWith("ORDER_")) return ShoppingCart
  if (type.startsWith("WALLET_")) return Wallet
  if (type.startsWith("SECURITY_")) return Shield
  if (type.startsWith("CHAT_")) return ChatCircle
  if (type.startsWith("DISPUTE_")) return Scales
  if (type.startsWith("KYC_")) return Shield
  if (type.startsWith("RANKING_")) return Star
  if (type.startsWith("REFERRAL_")) return Gift
  if (type.startsWith("SUBSCRIPTION_") || type.startsWith("BADGE_")) return Crown
  if (type.startsWith("MARKETING_")) return Megaphone
  if (type.startsWith("SYSTEM_")) return Gear
  return Bell
}

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
}

export const NotificationItem = memo(function NotificationItem({
  notification,
  onMarkRead,
}: NotificationItemProps) {
  const router = useRouter()
  const NotifIcon = getNotificationIcon(notification.type)

  const handleClick = () => {
    if (!notification.isRead) onMarkRead(notification.id)
    // NOTE-L09 FIX: Validate actionUrl is an internal relative path before
    // calling router.push(). External or protocol-relative URLs would cause
    // Next.js router to behave unexpectedly or fail silently.
    if (notification.actionUrl && notification.actionUrl.startsWith("/")) {
      router.push(notification.actionUrl)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <article
      aria-label={`${notification.isRead ? "" : "Belum dibaca: "}${notification.title}`}
      data-testid={`notification-item-${notification.id}`}
      className={cn(
        "flex items-start gap-4 rounded-lg border p-4 transition-colors cursor-pointer hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        !notification.isRead && "border-l-4 border-l-primary bg-primary/[0.02]"
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
        <NotifIcon
          className={cn("size-5", !notification.isRead ? "text-primary" : "text-foreground/70")}
          aria-hidden="true"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className={cn("text-sm", !notification.isRead ? "font-semibold" : "font-medium")}>
          {notification.title}
        </p>
        <p className="text-sm text-muted-foreground">{notification.body}</p>
        <time
          dateTime={notification.createdAt}
          className="text-xs text-muted-foreground"
        >
          {formatRelative(notification.createdAt)}
        </time>
      </div>
      {!notification.isRead && (
        <div
          className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
          aria-hidden="true"
        />
      )}
    </article>
  )
})
