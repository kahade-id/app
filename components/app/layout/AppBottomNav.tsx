"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import {
  House, Receipt, Wallet, GearSix, Plus,
  ArrowCircleUp, ArrowCircleDown, Clock, DotsThree,
} from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"
import { ROUTES } from "@/lib/constants"
import { useWallet } from "@/lib/hooks/use-wallet"
import { formatIDR } from "@/lib/currency"

// ── Visibility ────────────────────────────────────────────────
const NAV_VISIBLE_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.TRANSACTIONS,
  ROUTES.SETTINGS,
]

function useNavVisible(pathname: string): boolean {
  return NAV_VISIBLE_ROUTES.some((r) =>
    pathname === r || pathname.startsWith(r + "/")
  )
}

// ── Tokens ────────────────────────────────────────────────────
const INACTIVE = "#757575"
const ACTIVE   = "#0f0f0f"
const PILL_H   = 58
const PAD      = 5
const PAD_X    = 16
const PB       = 16
const FAB_SIZE = 52

// ── Nav items ─────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Beranda",   href: ROUTES.DASHBOARD,    icon: House,    isWallet: false },
  { label: "Transaksi", href: ROUTES.TRANSACTIONS, icon: Receipt,  isWallet: false },
  { label: "Dompet",    href: ROUTES.WALLET,       icon: Wallet,   isWallet: true  },
  { label: "Pengaturan",href: ROUTES.SETTINGS,     icon: GearSix,  isWallet: false },
] as const

// ── Wallet actions ────────────────────────────────────────────
const WALLET_ACTIONS = [
  { label: "Top Up",     href: ROUTES.WALLET_TOPUP,    icon: ArrowCircleUp,   bg: "#e6f7ee", color: "#16a34a", testId: "ws-topup"    },
  { label: "Tarik Dana", href: ROUTES.WALLET_WITHDRAW, icon: ArrowCircleDown, bg: "#fff2e8", color: "#ea580c", testId: "ws-withdraw" },
  { label: "Riwayat",    href: ROUTES.WALLET_HISTORY,  icon: Clock,           bg: "#e8f0fe", color: "#3b5bdb", testId: "ws-history"  },
  { label: "Detail",     href: ROUTES.WALLET,          icon: DotsThree,       bg: "#f2f2f2", color: "#525252", testId: "ws-detail"   },
] as const

export function AppBottomNav() {
  const pathname          = usePathname()
  const router            = useRouter()
  const visible           = useNavVisible(pathname)
  const { data: wallet }  = useWallet()

  const [isDesktop, setIsDesktop] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mq.matches)
    const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", h)
    return () => mq.removeEventListener("change", h)
  }, [])

  useEffect(() => { setSheetOpen(false) }, [pathname])

  // Close on outside tap
  useEffect(() => {
    if (!sheetOpen) return
    function onPointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setSheetOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [sheetOpen])

  if (!visible || isDesktop) return null

  const activeIndex = NAV_ITEMS.findIndex((item) => {
    if (item.isWallet) return sheetOpen
    return pathname === item.href || pathname.startsWith(item.href + "/")
  })

  function handleTap(item: (typeof NAV_ITEMS)[number]) {
    if (item.isWallet) { setSheetOpen((v) => !v); return }
    setSheetOpen(false)
    router.push(item.href)
  }

  function goWallet(href: string) {
    setSheetOpen(false)
    router.push(href)
  }

  return (
    <nav
      ref={panelRef}
      aria-label="Navigasi bawah"
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      <div className="pb-[env(safe-area-inset-bottom)]">
        <div style={{ paddingLeft: PAD_X, paddingRight: PAD_X, paddingBottom: PB, paddingTop: 4, position: "relative", display: "flex", alignItems: "center", gap: 10 }}>

          {/* ── Scrim ──────────────────────────────────── */}
          <AnimatePresence>
            {sheetOpen && (
              <motion.div
                key="scrim"
                className="fixed inset-0 z-40"
                style={{ background: "rgba(0,0,0,0.22)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onPointerDown={() => setSheetOpen(false)}
                aria-hidden="true"
              />
            )}
          </AnimatePresence>

          {/* ── Wallet panel (expands upward) ─────────── */}
          <AnimatePresence>
            {sheetOpen && (
              <motion.div
                key="wallet-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Menu Dompet"
                className="absolute left-0 right-0 z-50"
                style={{ bottom: PB + PILL_H + 8, paddingLeft: PAD_X, paddingRight: PAD_X }}
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0,   scale: 1    }}
                exit={{    opacity: 0, y: 12,  scale: 0.97 }}
                transition={{ type: "spring", stiffness: 480, damping: 38, mass: 0.75 }}
              >
                <div style={{
                  borderRadius:         28,
                  overflow:             "hidden",
                  background:           "rgba(255,255,255,0.97)",
                  backdropFilter:       "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  boxShadow:
                    "0 -1px 0 rgba(255,255,255,0.8) inset," +
                    "0 20px 56px rgba(0,0,0,0.13)," +
                    "0 4px 16px rgba(0,0,0,0.07)," +
                    "0 1px 0 rgba(0,0,0,0.04)",
                  border: "1px solid rgba(255,255,255,0.7)",
                }}>
                  {/* Drag pill */}
                  <div className="flex justify-center" style={{ paddingTop: 10, paddingBottom: 4 }}>
                    <div style={{ width: 32, height: 4, borderRadius: 999, background: "#e0e0e0" }} />
                  </div>

                  <div style={{ padding: "10px 18px 20px" }}>
                    {/* Balance */}
                    <div style={{ background: "#f6f6f6", borderRadius: 18, padding: "14px 16px", marginBottom: 16 }}>
                      <p style={{ fontSize: 10.5, fontWeight: 600, color: "#9e9e9e", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                        Saldo Tersedia
                      </p>
                      <p style={{ fontSize: 26, fontWeight: 700, color: "#0f0f0f", letterSpacing: "-0.03em", lineHeight: 1 }}>
                        {wallet ? formatIDR(wallet.availableBalance) : "—"}
                      </p>
                      {wallet && (
                        <p style={{ fontSize: 12, color: "#757575", marginTop: 6, lineHeight: 1 }}>
                          Dana Escrow: {formatIDR(wallet.escrowBalance)}
                        </p>
                      )}
                    </div>

                    {/* 4 actions */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                      {WALLET_ACTIONS.map((action, i) => {
                        const Icon = action.icon
                        return (
                          <motion.button
                            key={action.testId}
                            data-testid={action.testId}
                            onClick={() => goWallet(action.href)}
                            className="flex flex-col items-center"
                            style={{ gap: 7, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                            whileTap={{ scale: 0.84 }}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 32, delay: 0.04 + i * 0.04 }}
                          >
                            <div style={{
                              width: "100%", aspectRatio: "1 / 1",
                              background: action.bg, borderRadius: 20,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <Icon size={26} weight="fill" style={{ color: action.color }} />
                            </div>
                            <span style={{ fontSize: 11.5, fontWeight: 500, color: "#525252", lineHeight: 1.2, textAlign: "center" }}>
                              {action.label}
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── FAB Plus — sebaris kanan pill ─────────── */}
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
                width: FAB_SIZE, height: PILL_H,
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

          {/* ── Pill — 4-tab connected bar ────────────── */}
          <div
            className="relative flex items-center w-full"
            style={{
              height: PILL_H, padding: PAD, borderRadius: 999,
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
            {/* Sliding highlight */}
            <motion.span
              className="absolute rounded-full"
              animate={{
                left:    activeIndex >= 0 ? `calc(${PAD}px + ${activeIndex} * 25%)` : PAD,
                opacity: activeIndex >= 0 ? 1 : 0,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.7 }}
              style={{
                width: "calc(25%)", height: PILL_H - PAD * 2,
                top: PAD, background: "rgba(0,0,0,0.07)", pointerEvents: "none",
              }}
            />

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
                    style={{ height: PILL_H - PAD * 2, gap: 2 }}
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
                      fontSize: 10.5, fontWeight: active ? 700 : 600,
                      color: active ? ACTIVE : INACTIVE,
                      lineHeight: 1, letterSpacing: "-0.01em", transition: "color 0.15s",
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
  )
}
