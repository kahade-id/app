"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { House, Receipt, Wallet, User, Plus } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"

// Pages where the bottom nav should be visible.
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

const NAV_ITEMS = [
  { label: "Beranda",   href: ROUTES.DASHBOARD,    icon: House   },
  { label: "Transaksi", href: ROUTES.TRANSACTIONS, icon: Receipt },
  { label: "Dompet",    href: ROUTES.WALLET,       icon: Wallet  },
  { label: "Profil",    href: ROUTES.PROFILE,      icon: User    },
]

export function AppBottomNav() {
  const pathname = usePathname()
  const isVisible = useIsBottomNavVisible(pathname)

  // H-2 FIX: isDesktop must live in state, not evaluated inline during render.
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024)
  }, [])

  if (!isVisible) return null

  return (
    <nav
      aria-label="Navigasi bawah"
      aria-hidden={isDesktop ? true : undefined}
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
    >
      {/* Safe-area spacer */}
      <div className="bg-white pb-[env(safe-area-inset-bottom)]">
        {/* Pill container + plus button row */}
        <div className="flex items-center gap-3 px-4 py-3">

          {/* ── Pill navbar ─────────────────────────────────── */}
          <div className="flex flex-1 items-center justify-around bg-white rounded-full shadow-[0_2px_16px_rgba(0,0,0,0.10)] px-2 py-2">
            {NAV_ITEMS.map((item) => {
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
                  className="flex flex-col items-center gap-1 min-w-[60px] transition-colors"
                >
                  {/* Icon bubble */}
                  <span
                    className={cn(
                      "flex items-center justify-center size-10 rounded-full transition-colors",
                      isActive ? "bg-gray-100" : "bg-transparent"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5 transition-colors",
                        isActive ? "text-primary" : "text-gray-400"
                      )}
                      weight={isActive ? "fill" : "regular"}
                    />
                  </span>
                  {/* Label */}
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none transition-colors",
                      isActive ? "text-primary" : "text-gray-400"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* ── Plus button ─────────────────────────────────── */}
          <Link
            href={ROUTES.TRANSACTION_NEW}
            aria-label="Buat transaksi baru"
            data-testid="nav-link-buat-transaksi"
            className={cn(
              "flex items-center justify-center size-14 rounded-full shrink-0",
              "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.10)]",
              "transition-colors hover:bg-gray-50 active:bg-gray-100"
            )}
          >
            <Plus className="size-5 text-gray-500" weight="bold" />
          </Link>

        </div>
      </div>
    </nav>
  )
}
