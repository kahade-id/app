"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { House, Receipt, Wallet, User, Plus } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"

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

// ── Design tokens ──────────────────────────────────────────
const INACTIVE_COLOR = "#757575"  // unified — same for all icons + labels + plus
const ACTIVE_COLOR   = "#0f0f0f"  // near-black for active state

const ITEM_W  = 72   // px — width per tab
const ITEM_H  = 48   // px — inner height (tighter than before)
const PAD     = 5    // px — pill padding
const PILL_H  = ITEM_H + PAD * 2  // 58px total
const PLUS_SZ = PILL_H            // + circle matches pill height

export function AppBottomNav() {
  const pathname = usePathname()
  const isVisible = useIsBottomNavVisible(pathname)

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
          style={{ paddingBottom: 16, paddingTop: 4 }}
        >

          {/* ── Pill ─────────────────────────────────── */}
          <div
            className="relative flex flex-1 items-center rounded-[999px] border border-white/60"
            style={{
              height: PILL_H,
              padding: PAD,
              // Glass effect
              background: "rgba(255,255,255,0.78)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.08)," +
                "0 2px 8px rgba(0,0,0,0.05)," +
                "inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            {/* ── Sliding highlight ─────────────────── */}
            {activeIndex !== -1 && (
              <motion.span
                layoutId="nav-pill"
                className="absolute rounded-full"
                style={{
                  width: ITEM_W,
                  height: ITEM_H,
                  top: PAD,
                  left: PAD + activeIndex * ITEM_W,
                  background: "rgba(0,0,0,0.07)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 38,
                  mass: 0.7,
                }}
              />
            )}

            {NAV_ITEMS.map((item, index) => {
              const isActive = index === activeIndex
              const Icon = item.icon

              return (
                <motion.div
                  key={item.href}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 600, damping: 28 }}
                  style={{ width: ITEM_W, height: ITEM_H, flexShrink: 0 }}
                >
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    data-testid={`nav-link-${item.label.toLowerCase()}`}
                    className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-[2px] select-none"
                  >
                    <motion.div
                      animate={isActive
                        ? { scale: 1.1, y: -1 }
                        : { scale: 1,   y: 0  }
                      }
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Icon
                        size={22}
                        weight={isActive ? "fill" : "regular"}
                        style={{ color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR }}
                      />
                    </motion.div>
                    <span
                      className="leading-none tracking-tight"
                      style={{
                        fontSize: 10.5,
                        fontWeight: isActive ? 650 : 500,
                        color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR,
                        transition: "color 0.18s, font-weight 0.18s",
                      }}
                    >
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* ── Plus ─────────────────────────────────── */}
          <motion.div
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 600, damping: 28 }}
            style={{ flexShrink: 0 }}
          >
            <Link
              href={ROUTES.TRANSACTION_NEW}
              aria-label="Buat transaksi baru"
              data-testid="nav-link-buat-transaksi"
              className="flex items-center justify-center rounded-full border border-white/60"
              style={{
                width: PLUS_SZ,
                height: PLUS_SZ,
                background: "rgba(255,255,255,0.78)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.08)," +
                  "0 2px 8px rgba(0,0,0,0.05)," +
                  "inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              <Plus size={20} weight="bold" style={{ color: INACTIVE_COLOR }} />
            </Link>
          </motion.div>

        </div>
      </div>
    </nav>
  )
}
