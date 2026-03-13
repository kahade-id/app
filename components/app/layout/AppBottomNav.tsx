"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { SquaresFour, ArrowsLeftRight, Wallet, Bell, User } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"
import { useUnreadNotificationCount } from "@/lib/hooks/use-notifications"

const BOTTOM_NAV_ITEMS = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: SquaresFour },
  { label: "Transaksi", href: ROUTES.TRANSACTIONS, icon: ArrowsLeftRight },
  { label: "Dompet", href: ROUTES.WALLET, icon: Wallet },
  { label: "Notifikasi", href: ROUTES.NOTIFICATIONS, icon: Bell },
  { label: "Profil", href: ROUTES.PROFILE, icon: User },
]

export function AppBottomNav() {
  const pathname = usePathname()
  const { data: unreadCount = 0 } = useUnreadNotificationCount()

  // H-2 FIX: isDesktop must live in state, not evaluated inline during render.
  // Inline evaluation returns false on SSR (no window), but potentially true on client,
  // causing a hydration mismatch. useState(false) ensures SSR and client first-render match.
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024)
  }, [])

  return (
    <nav
      aria-label="Navigasi bawah"
      aria-hidden={isDesktop ? true : undefined}
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around h-16">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          const showBadge = item.href === ROUTES.NOTIFICATIONS && unreadCount > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              data-testid={`nav-link-${item.label.toLowerCase()}`}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className="size-5" />
                {showBadge && (
                  <span className="absolute -top-1 -right-1.5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold min-w-[14px] h-[14px] px-0.5">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
