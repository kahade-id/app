"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { House, Receipt, Wallet, GearSix, Plus } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { ROUTES } from "@/lib/constants"
import { WalletFloatingSheet, PAD_X, PB } from "@/components/app/wallet/WalletFloatingSheet"

// ── Bottom nav is visible on these routes only ────────────────
const NAV_VISIBLE_ROUTES = [
  ROUTES.DASHBOARD,    // "/beranda"
  ROUTES.TRANSACTIONS, // "/transaksi"
  ROUTES.SETTINGS,     // "/pengaturan"
]

function useNavVisible(pathname: string): boolean {
  return NAV_VISIBLE_ROUTES.some((r) =>
    pathname === r || pathname.startsWith(r + "/")
  )
}

// ── Tokens ────────────────────────────────────────────────────
const INACTIVE = "#757575"
const ACTIVE   = "#0f0f0f"

const PILL_H = 58   // pill height
const PAD    = 5    // inner padding

const NAV_ITEMS = [
  { label: "Beranda",   href: ROUTES.DASHBOARD,    icon: House,   isWallet: false },
  { label: "Transaksi", href: ROUTES.TRANSACTIONS, icon: Receipt, isWallet: false },
  { label: "Dompet",    href: ROUTES.WALLET,       icon: Wallet,  isWallet: true  },
  { label: "Pengaturan", href: ROUTES.SETTINGS,    icon: GearSix, isWallet: false },
] as const

const FAB_SIZE = 52

export function AppBottomNav() {
  const pathname = usePathname()
  const router   = useRouter()
  const visible  = useNavVisible(pathname)

  const [isDesktop, setIsDesktop] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

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
  const activeIndex = NAV_ITEMS.findIndex((item) => {
    if (item.isWallet) return sheetOpen
    return pathname === item.href || pathname.startsWith(item.href + "/")
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
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="pb-[env(safe-area-inset-bottom)]">
          <div
            style={{
              paddingLeft:   PAD_X,
              paddingRight:  PAD_X,
              paddingBottom: PB,
              paddingTop:    4,
              position:      "relative",
            }}
          >

            {/* ── FAB Plus — floating above the pill ─────────
                Positioned at top-right of the nav zone, above the pill */}
            <motion.div
              whileTap={{ scale: 0.86 }}
              transition={{ type: "spring", stiffness: 600, damping: 28 }}
              style={{
                position: "absolute",
                right:    PAD_X,
                bottom:   PB + PILL_H + 12,
                zIndex:   60,
              }}
            >
              <Link
                href={ROUTES.TRANSACTION_NEW}
                aria-label="Buat transaksi baru"
                data-testid="nav-plus"
                onClick={() => setSheetOpen(false)}
                className="flex items-center justify-center rounded-full"
                style={{
                  width:                FAB_SIZE,
                  height:               FAB_SIZE,
                  background:           "rgba(255,255,255,0.90)",
                  backdropFilter:       "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border:               "1px solid rgba(255,255,255,0.7)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.9)," +
                    "0 8px 32px rgba(0,0,0,0.10)," +
                    "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Plus size={22} weight="bold" style={{ color: INACTIVE }} />
              </Link>
            </motion.div>

            {/* ── Pill — full-width 4-tab connected bar ───── */}
            <div
              className="relative flex items-center w-full"
              style={{
                height:               PILL_H,
                padding:              PAD,
                borderRadius:         999,
                background:           "rgba(255,255,255,0.82)",
                backdropFilter:       "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border:               "1px solid rgba(255,255,255,0.6)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.9)," +
                  "0 8px 32px rgba(0,0,0,0.08)," +
                  "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {/* ── Sliding highlight ─────────────────────── */}
              <motion.span
                className="absolute rounded-full"
                animate={{
                  left:    activeIndex >= 0
                    ? `calc(${PAD}px + ${activeIndex} * 25%)`
                    : PAD,
                  opacity: activeIndex >= 0 ? 1 : 0,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.7 }}
                style={{
                  width:         "calc(25%)",
                  height:        PILL_H - PAD * 2,
                  top:           PAD,
                  background:    "rgba(0,0,0,0.07)",
                  pointerEvents: "none",
                }}
              />

              {/* ── Tabs — each takes equal 25% width ────── */}
              {NAV_ITEMS.map((item, i) => {
                const active = i === activeIndex
                const Icon   = item.icon

                return (
                  <motion.div
                    key={item.label}
                    whileTap={{ scale: 0.86 }}
                    transition={{ type: "spring", stiffness: 600, damping: 28 }}
                    style={{ flex: 1 }}
                  >
                    <button
                      aria-current={active ? "page" : undefined}
                      aria-label={item.isWallet ? "Buka menu dompet" : item.label}
                      data-testid={`nav-${item.label.toLowerCase()}`}
                      onClick={() => handleTap(item)}
                      className="relative z-10 flex w-full flex-col items-center justify-center select-none border-0 bg-transparent"
                      style={{
                        height: PILL_H - PAD * 2,
                        gap:    2,
                      }}
                    >
                      <motion.div
                        animate={active ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <Icon
                          size={22}
                          weight={active ? "fill" : "bold"}
                          style={{ color: active ? ACTIVE : INACTIVE }}
                        />
                      </motion.div>
                      <span style={{
                        fontSize:      10.5,
                        fontWeight:    active ? 700 : 600,
                        color:         active ? ACTIVE : INACTIVE,
                        lineHeight:    1,
                        letterSpacing: "-0.01em",
                        transition:    "color 0.15s",
                      }}>
                        {item.label}
                      </span>
                    </button>
                  </motion.div>
                )
              })}
            </div>

          </div>
        </div>
      </nav>
    </>
  )
}
