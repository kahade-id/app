"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { House, Receipt, Wallet, User, Plus } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { ROUTES } from "@/lib/constants"
import { WalletFloatingSheet, PILL_H, PAD_X, PB } from "@/components/app/wallet/WalletFloatingSheet"

// ── Bottom nav is visible on these routes only ────────────────
// NOTE: /wallet and sub-routes are intentionally excluded — the wallet
// interaction on mobile is handled entirely by WalletFloatingSheet.
const NAV_VISIBLE_ROUTES = [
  ROUTES.DASHBOARD,    // "/"
  ROUTES.TRANSACTIONS, // "/transaksi"
  ROUTES.PROFILE,      // "/profil"
]

function useNavVisible(pathname: string): boolean {
  return NAV_VISIBLE_ROUTES.some((r) =>
    r === "/" ? pathname === "/" : pathname === r || pathname.startsWith(r + "/")
  )
}

// ── Tokens ────────────────────────────────────────────────────
const INACTIVE = "#757575"
const ACTIVE   = "#0f0f0f"

const ITEM_W = 72
const ITEM_H = 48
const PAD    = 5
// PILL_H is imported from WalletFloatingSheet (58px)
const PLUS_W = PILL_H  // + button = same height as pill

const NAV_ITEMS = [
  { label: "Beranda",   href: ROUTES.DASHBOARD,    icon: House,   isWallet: false },
  { label: "Transaksi", href: ROUTES.TRANSACTIONS, icon: Receipt, isWallet: false },
  { label: "Dompet",    href: ROUTES.WALLET,       icon: Wallet,  isWallet: true  },
  { label: "Profil",    href: ROUTES.PROFILE,      icon: User,    isWallet: false },
] as const

export function AppBottomNav() {
  const pathname = usePathname()
  const router   = useRouter()
  const visible  = useNavVisible(pathname)

  const [isDesktop,   setIsDesktop]   = useState(false)
  const [sheetOpen,   setSheetOpen]   = useState(false)

  // Responsive: hide on lg+
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mq.matches)
    const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", h)
    return () => mq.removeEventListener("change", h)
  }, [])

  // Close sheet on any route change
  useEffect(() => { setSheetOpen(false) }, [pathname])

  if (!visible || isDesktop) return null

  // ── Active index ───────────────────────────────────────────
  // Dompet is "active" when the sheet is open (regardless of pathname)
  const activeIndex = NAV_ITEMS.findIndex((item) => {
    if (item.isWallet) return sheetOpen
    return item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(item.href + "/")
  })

  function handleTap(item: (typeof NAV_ITEMS)[number]) {
    if (item.isWallet) {
      setSheetOpen((v) => !v)
      return
    }
    setSheetOpen(false)
    router.push(item.href)
  }

  return (
    <>
      {/* ── Wallet sheet ──────────────────────────────────── */}
      <WalletFloatingSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

      {/* ── Nav bar ───────────────────────────────────────── */}
      <nav
        aria-label="Navigasi bawah"
        className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
      >
        <div className="pb-[env(safe-area-inset-bottom)]">
          <div
            className="flex items-center gap-3 pointer-events-auto"
            style={{ paddingLeft: PAD_X, paddingRight: PAD_X, paddingBottom: PB, paddingTop: 4 }}
          >

            {/* ── Pill ────────────────────────────────────── */}
            <div
              className="relative flex flex-1 items-center"
              style={{
                height:               PILL_H,
                padding:              PAD,
                borderRadius:         999,
                background:           "rgba(255,255,255,0.78)",
                backdropFilter:       "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border:               "1px solid rgba(255,255,255,0.6)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.9)," +
                  "0 8px 32px rgba(0,0,0,0.08)," +
                  "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {/* ── Sliding highlight ─────────────────────
                  Uses `animate` (not layoutId) so it ALWAYS slides smoothly
                  regardless of navigation, re-renders, or route changes.
                  The span is always mounted — just repositioned. */}
              <motion.span
                className="absolute rounded-full"
                animate={{
                  left:    PAD + Math.max(0, activeIndex) * ITEM_W,
                  opacity: activeIndex >= 0 ? 1 : 0,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.7 }}
                style={{
                  width:      ITEM_W,
                  height:     ITEM_H,
                  top:        PAD,
                  background: "rgba(0,0,0,0.07)",
                  pointerEvents: "none",
                }}
              />

              {/* ── Tabs ────────────────────────────────── */}
              {NAV_ITEMS.map((item, i) => {
                const active = i === activeIndex
                const Icon   = item.icon

                return (
                  <motion.div
                    key={item.label}
                    whileTap={{ scale: 0.86 }}
                    transition={{ type: "spring", stiffness: 600, damping: 28 }}
                    style={{ width: ITEM_W, height: ITEM_H, flexShrink: 0 }}
                  >
                    <button
                      aria-current={active ? "page" : undefined}
                      aria-label={item.isWallet ? "Buka menu dompet" : item.label}
                      data-testid={`nav-${item.label.toLowerCase()}`}
                      onClick={() => handleTap(item)}
                      className="relative z-10 flex h-full w-full flex-col items-center justify-center select-none border-0 bg-transparent"
                      style={{ gap: 2 }}
                    >
                      <motion.div
                        animate={active ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <Icon
                          size={22}
                          weight={active ? "fill" : "regular"}
                          style={{ color: active ? ACTIVE : INACTIVE }}
                        />
                      </motion.div>
                      <span style={{
                        fontSize:   10.5,
                        fontWeight: active ? 650 : 500,
                        color:      active ? ACTIVE : INACTIVE,
                        lineHeight: 1,
                        letterSpacing: "-0.01em",
                        transition: "color 0.15s",
                      }}>
                        {item.label}
                      </span>
                    </button>
                  </motion.div>
                )
              })}
            </div>

            {/* ── Plus button ─────────────────────────────── */}
            <motion.div
              whileTap={{ scale: 0.86 }}
              transition={{ type: "spring", stiffness: 600, damping: 28 }}
              style={{ flexShrink: 0 }}
            >
              <Link
                href={ROUTES.TRANSACTION_NEW}
                aria-label="Buat transaksi baru"
                data-testid="nav-plus"
                onClick={() => setSheetOpen(false)}
                className="flex items-center justify-center rounded-full"
                style={{
                  width:                PLUS_W,
                  height:               PLUS_W,
                  background:           "rgba(255,255,255,0.78)",
                  backdropFilter:       "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border:               "1px solid rgba(255,255,255,0.6)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.9)," +
                    "0 8px 32px rgba(0,0,0,0.08)," +
                    "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <Plus size={20} weight="bold" style={{ color: INACTIVE }} />
              </Link>
            </motion.div>

          </div>
        </div>
      </nav>
    </>
  )
}
