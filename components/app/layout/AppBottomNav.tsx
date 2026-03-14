"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { House, Receipt, Wallet, User, Plus } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"

// Pages where the bottom nav should be visible.
const BOTTOM_NAV_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.TRANSACTIONS,
  ROUTES.WALLET,
  ROUTES.PROFILE,
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

// Pill geometry — all measurements in px for pixel-perfect alignment
const ITEM_W    = 72   // width of each nav tab
const ITEM_H    = 60   // height of the pill container inner area
const PAD       = 5    // pill inner padding
const PILL_H    = ITEM_H + PAD * 2   // total pill outer height = 70px
const PLUS_SIZE = PILL_H             // + button matches pill height exactly

export function AppBottomNav() {
  const pathname = usePathname()
  const isVisible = useIsBottomNavVisible(pathname)

  // H-2 FIX: isDesktop in state to prevent SSR hydration mismatch
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  if (!isVisible || isDesktop) return null

  const activeIndex = NAV_ITEMS.findIndex((item) =>
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(item.href + "/")
  )

  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
    >
      <div className="pb-[env(safe-area-inset-bottom)]">
        <div
          className="flex items-center gap-3 px-4 pointer-events-auto"
          style={{ paddingBottom: 14, paddingTop: 6 }}
        >

          {/* ── Pill ────────────────────────────────────────── */}
          <div
            className="relative flex flex-1 items-center bg-white rounded-[999px]"
            style={{
              height: PILL_H,
              padding: PAD,
              boxShadow: "0 4px 24px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            {/* Sliding active highlight */}
            {activeIndex !== -1 && (
              <motion.span
                layoutId="bottom-nav-highlight"
                className="absolute rounded-full bg-gray-100"
                style={{
                  width: ITEM_W,
                  height: ITEM_H,
                  top: PAD,
                  left: PAD + activeIndex * ITEM_W,
                }}
                transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.85 }}
              />
            )}

            {NAV_ITEMS.map((item, index) => {
              const isActive = index === activeIndex
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  data-testid={`nav-link-${item.label.toLowerCase()}`}
                  className="relative z-10 flex flex-col items-center justify-center gap-[3px] select-none"
                  style={{ width: ITEM_W, height: ITEM_H, flexShrink: 0 }}
                >
                  <Icon
                    size={24}
                    weight={isActive ? "fill" : "regular"}
                    className={cn(
                      "transition-all duration-200",
                      isActive
                        ? "text-gray-900 scale-[1.08]"
                        : "text-gray-400"
                    )}
                  />
                  <span
                    className={cn(
                      "transition-all duration-200 leading-none tracking-tight",
                      isActive
                        ? "text-[11px] font-semibold text-gray-900"
                        : "text-[11px] font-medium text-gray-400"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* ── Plus ────────────────────────────────────────── */}
          <Link
            href={ROUTES.TRANSACTION_NEW}
            aria-label="Buat transaksi baru"
            data-testid="nav-link-buat-transaksi"
            className="flex items-center justify-center shrink-0 rounded-full bg-white active:scale-95 transition-transform"
            style={{
              width: PLUS_SIZE,
              height: PLUS_SIZE,
              boxShadow: "0 4px 24px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <Plus size={22} weight="bold" className="text-gray-500" />
          </Link>

        </div>
      </div>
    </nav>
  )
}
