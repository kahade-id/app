"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { House, Receipt, Wallet, User, Plus } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"
import { WalletFloatingSheet } from "@/components/app/wallet/WalletFloatingSheet"

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
  { label: "Beranda",   href: ROUTES.DASHBOARD,    icon: House,    isWallet: false },
  { label: "Transaksi", href: ROUTES.TRANSACTIONS, icon: Receipt,  isWallet: false },
  { label: "Dompet",    href: ROUTES.WALLET,       icon: Wallet,   isWallet: true  },
  { label: "Profil",    href: ROUTES.PROFILE,      icon: User,     isWallet: false },
]

// ── Design tokens ──────────────────────────────────────────
const INACTIVE_COLOR = "#757575"
const ACTIVE_COLOR   = "#0f0f0f"

const ITEM_W  = 72
const ITEM_H  = 48
const PAD     = 5
const PILL_H  = ITEM_H + PAD * 2  // 58px
const PLUS_SZ = PILL_H
// Sheet sits this many px above the bottom of the screen
// = safe-area + bottom padding (16) + pill height (58) + gap (10)
const SHEET_BOTTOM_OFFSET = 16 + PILL_H + 10

export function AppBottomNav() {
  const pathname  = usePathname()
  const router    = useRouter()
  const isVisible = useIsBottomNavVisible(pathname)

  const [isDesktop,        setIsDesktop]        = useState(false)
  const [walletSheetOpen,  setWalletSheetOpen]  = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Close wallet sheet on route change
  useEffect(() => { setWalletSheetOpen(false) }, [pathname])

  if (!isVisible || isDesktop) return null

  const activeIndex = NAV_ITEMS.findIndex((item) =>
    item.isWallet
      ? walletSheetOpen || pathname === item.href || pathname.startsWith(item.href + "/")
      : item.href === "/"
        ? pathname === "/"
        : pathname === item.href || pathname.startsWith(item.href + "/")
  )

  function handleNavTap(item: typeof NAV_ITEMS[number], index: number) {
    if (item.isWallet) {
      // Toggle wallet sheet — don't navigate
      setWalletSheetOpen((prev) => !prev)
      return
    }
    // Close wallet sheet and navigate
    setWalletSheetOpen(false)
    router.push(item.href)
  }

  return (
    <>
      {/* ── Wallet floating sheet (lives outside nav z-stack) ─ */}
      <WalletFloatingSheet
        open={walletSheetOpen}
        onClose={() => setWalletSheetOpen(false)}
        bottomOffset={SHEET_BOTTOM_OFFSET}
      />

      {/* ── Bottom nav ──────────────────────────────────────── */}
      <nav
        aria-label="Navigasi bawah"
        className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
      >
        <div className="pb-[env(safe-area-inset-bottom)]">
          <div
            className="flex items-center gap-3 px-4 pointer-events-auto"
            style={{ paddingBottom: 16, paddingTop: 4 }}
          >

            {/* ── Pill ────────────────────────────────────── */}
            <div
              className="relative flex flex-1 items-center rounded-[999px] border border-white/60"
              style={{
                height: PILL_H,
                padding: PAD,
                background: "rgba(255,255,255,0.78)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.08)," +
                  "0 2px 8px rgba(0,0,0,0.05)," +
                  "inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              {/* Sliding highlight */}
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
                  transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.7 }}
                />
              )}

              {NAV_ITEMS.map((item, index) => {
                const isActive = index === activeIndex
                const Icon     = item.icon

                return (
                  <motion.div
                    key={item.href}
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: "spring", stiffness: 600, damping: 28 }}
                    style={{ width: ITEM_W, height: ITEM_H, flexShrink: 0 }}
                  >
                    <button
                      aria-current={isActive ? "page" : undefined}
                      aria-label={item.isWallet ? "Buka menu dompet" : item.label}
                      data-testid={`nav-link-${item.label.toLowerCase()}`}
                      onClick={() => handleNavTap(item, index)}
                      className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-[2px] select-none bg-transparent border-0"
                    >
                      <motion.div
                        animate={isActive ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
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
                          transition: "color 0.18s",
                        }}
                      >
                        {item.label}
                      </span>
                    </button>
                  </motion.div>
                )
              })}
            </div>

            {/* ── Plus ────────────────────────────────────── */}
            <motion.div
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 600, damping: 28 }}
              style={{ flexShrink: 0 }}
            >
              <Link
                href={ROUTES.TRANSACTION_NEW}
                aria-label="Buat transaksi baru"
                data-testid="nav-link-buat-transaksi"
                onClick={() => setWalletSheetOpen(false)}
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
    </>
  )
}
