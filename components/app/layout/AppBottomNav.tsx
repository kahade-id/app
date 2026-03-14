"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { House, Receipt, Wallet, User, Plus } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"
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

// ITEM_SIZE: each nav item and the + button are exactly this size (square).
// The pill container height = ITEM_SIZE + 2*PILL_PADDING.
const ITEM_SIZE = 56  // px — size-14 equivalent
const PILL_PADDING = 4 // px — p-1 equivalent

export function AppBottomNav() {
  const pathname = usePathname()
  const isVisible = useIsBottomNavVisible(pathname)

  // H-2 FIX: isDesktop must live in state, not evaluated inline during render.
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024)
  }, [])

  if (!isVisible) return null

  const activeIndex = NAV_ITEMS.findIndex((item) =>
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(item.href + "/")
  )

  return (
    <nav
      aria-label="Navigasi bawah"
      aria-hidden={isDesktop ? true : undefined}
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pointer-events-none"
    >
      {/* Transparent safe-area spacer — no background */}
      <div className="pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center gap-3 px-4 py-3 pointer-events-auto">

          {/* ── Pill navbar ───────────────────────────────── */}
          {/* White bg ONLY on the pill itself, not on the outer nav */}
          <div
            className="relative flex flex-1 items-center rounded-full bg-white shadow-[0_2px_20px_rgba(0,0,0,0.10)]"
            style={{ padding: PILL_PADDING }}
          >
            {/* Sliding active background — shared layoutId moves it between items */}
            <AnimatePresence initial={false}>
              {activeIndex !== -1 && (
                <motion.span
                  key={activeIndex}
                  layoutId="nav-active-pill"
                  className="absolute top-[4px] rounded-full bg-gray-100"
                  style={{
                    width: ITEM_SIZE,
                    height: ITEM_SIZE,
                    // Position: left padding + (activeIndex × item width)
                    left: PILL_PADDING + activeIndex * ITEM_SIZE,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 32,
                    mass: 0.9,
                  }}
                />
              )}
            </AnimatePresence>

            {NAV_ITEMS.map((item, index) => {
              const isActive = index === activeIndex
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  data-testid={`nav-link-${item.label.toLowerCase()}`}
                  className="relative z-10 flex flex-col items-center justify-center gap-0.5"
                  style={{ width: ITEM_SIZE, height: ITEM_SIZE, flexShrink: 0 }}
                >
                  <Icon
                    className={cn(
                      "size-[18px] transition-colors duration-200",
                      isActive ? "text-primary" : "text-gray-400"
                    )}
                    weight={isActive ? "fill" : "regular"}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none transition-colors duration-200",
                      isActive ? "text-primary" : "text-gray-400"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* ── Plus button — same size as each nav item ──── */}
          <Link
            href={ROUTES.TRANSACTION_NEW}
            aria-label="Buat transaksi baru"
            data-testid="nav-link-buat-transaksi"
            className="flex items-center justify-center rounded-full bg-white shadow-[0_2px_20px_rgba(0,0,0,0.10)] shrink-0 transition-colors hover:bg-gray-50 active:bg-gray-100"
            style={{
              width: ITEM_SIZE + PILL_PADDING * 2,
              height: ITEM_SIZE + PILL_PADDING * 2,
            }}
          >
            <Plus className="size-[18px] text-gray-500" weight="bold" />
          </Link>

        </div>
      </div>
    </nav>
  )
}
