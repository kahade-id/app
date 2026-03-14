"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { House, Receipt, Plus, Wallet, User } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"

// Pages where the bottom nav should be visible.
// Checks both exact match (for root "/") and prefix match (for nested routes).
const BOTTOM_NAV_ROUTES = [
  ROUTES.DASHBOARD,    // "/"
  ROUTES.TRANSACTIONS, // "/transaksi"
  ROUTES.WALLET,       // "/wallet"
  ROUTES.PROFILE,      // "/profil"
]

function useIsBottomNavVisible(pathname: string): boolean {
  return BOTTOM_NAV_ROUTES.some((route) =>
    route === "/"
      ? pathname === "/"
      : pathname === route || pathname.startsWith(route + "/")
  )
}

const NAV_ITEMS_LEFT = [
  { label: "Beranda",   href: ROUTES.DASHBOARD,    icon: House   },
  { label: "Transaksi", href: ROUTES.TRANSACTIONS, icon: Receipt },
]

const NAV_ITEMS_RIGHT = [
  { label: "Dompet", href: ROUTES.WALLET,   icon: Wallet },
  { label: "Profil", href: ROUTES.PROFILE,  icon: User   },
]

export function AppBottomNav() {
  const pathname = usePathname()
  const isVisible = useIsBottomNavVisible(pathname)

  // H-2 FIX: isDesktop must live in state, not evaluated inline during render.
  // Inline evaluation returns false on SSR (no window), but potentially true on client,
  // causing a hydration mismatch. useState(false) ensures SSR and client first-render match.
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024)
  }, [])

  // Only render on the four designated pages, and never on desktop.
  if (!isVisible) return null

  return (
    <nav
      aria-label="Navigasi bawah"
      aria-hidden={isDesktop ? true : undefined}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white lg:hidden pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {/* Left items: Beranda, Transaksi */}
        {NAV_ITEMS_LEFT.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              data-testid={`nav-link-${item.label.toLowerCase()}`}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className="size-5"
                weight={isActive ? "fill" : "regular"}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Center: Quick-create transaction button */}
        <Link
          href={ROUTES.TRANSACTION_NEW}
          aria-label="Buat transaksi baru"
          data-testid="nav-link-buat-transaksi"
          className="flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="flex items-center justify-center size-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <Plus className="size-5 text-gray-600" weight="bold" />
          </span>
        </Link>

        {/* Right items: Dompet, Profil */}
        {NAV_ITEMS_RIGHT.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              data-testid={`nav-link-${item.label.toLowerCase()}`}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className="size-5"
                weight={isActive ? "fill" : "regular"}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
