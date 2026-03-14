"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
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

// ── Design tokens ─────────────────────────────────────────────
const INACTIVE  = "#757575"
const ACTIVE    = "#0f0f0f"
const PILL_H    = 58    // collapsed pill height
const PAD       = 5     // inner padding of pill
const PAD_X     = 16    // horizontal screen padding
const PB        = 16    // bottom padding
const FAB_SIZE  = PILL_H // FAB same height as pill

// ── Nav items ─────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Beranda",    href: ROUTES.DASHBOARD,    icon: House,    isWallet: false },
  { label: "Transaksi",  href: ROUTES.TRANSACTIONS, icon: Receipt,  isWallet: false },
  { label: "Dompet",     href: ROUTES.WALLET,       icon: Wallet,   isWallet: true  },
  { label: "Pengaturan", href: ROUTES.SETTINGS,     icon: GearSix,  isWallet: false },
] as const

// ── Wallet actions ─────────────────────────────────────────────
const WALLET_ACTIONS = [
  { label: "Top Up",     href: ROUTES.WALLET_TOPUP,    icon: ArrowCircleUp,   bg: "#e6f7ee", color: "#16a34a", testId: "ws-topup"    },
  { label: "Tarik Dana", href: ROUTES.WALLET_WITHDRAW, icon: ArrowCircleDown, bg: "#fff2e8", color: "#ea580c", testId: "ws-withdraw" },
  { label: "Riwayat",    href: ROUTES.WALLET_HISTORY,  icon: Clock,           bg: "#e8f0fe", color: "#3b5bdb", testId: "ws-history"  },
  { label: "Lainnya",    href: ROUTES.WALLET,          icon: DotsThree,       bg: "#f2f2f2", color: "#525252", testId: "ws-detail"   },
] as const

export function AppBottomNav() {
  const pathname         = usePathname()
  const router           = useRouter()
  const visible          = useNavVisible(pathname)

  const [isDesktop, setIsDesktop] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)
  const [isRounded, setIsRounded] = useState(true) // tracks borderRadius separately from walletOpen

  // When wallet opens → immediately square corners (24px)
  // When wallet closes → delay returning to pill (999px) until collapse finishes (~500ms)
  useEffect(() => {
    if (walletOpen) {
      setIsRounded(false)
    } else {
      const t = setTimeout(() => setIsRounded(true), 500)
      return () => clearTimeout(t)
    }
  }, [walletOpen])

  // Only fetch wallet when panel is open
  const { data: wallet } = useWallet()

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mq.matches)
    const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", h)
    return () => mq.removeEventListener("change", h)
  }, [])

  useEffect(() => { setWalletOpen(false) }, [pathname])

  if (!visible || isDesktop) return null

  // Wallet takes priority — even if pathname matches another tab
  const walletIndex = NAV_ITEMS.findIndex((item) => item.isWallet)
  const activeIndex = walletOpen
    ? walletIndex
    : NAV_ITEMS.findIndex((item) =>
        !item.isWallet && (pathname === item.href || pathname.startsWith(item.href + "/"))
      )

  function handleTap(item: (typeof NAV_ITEMS)[number]) {
    if (item.isWallet) { setWalletOpen((v) => !v); return }
    setWalletOpen(false)
    router.push(item.href)
  }

  function goWallet(href: string) {
    setWalletOpen(false)
    router.push(href)
  }

  // Pill inner width (for highlight calculation)
  // FAB takes FAB_SIZE + gap(10) from total screen - 2*PAD_X
  // pill takes the rest, inner = pill - 2*PAD

  return (
    <>
      {/* Scrim */}
      <AnimatePresence>
        {walletOpen && (
          <motion.div
            key="scrim"
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.25)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onPointerDown={() => setWalletOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <nav
        aria-label="Navigasi bawah"
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="pb-[env(safe-area-inset-bottom)]">
          <div
            style={{
              paddingLeft:  PAD_X,
              paddingRight: PAD_X,
              paddingBottom: PB,
              paddingTop: 4,
              display: "flex",
              alignItems: "flex-end",
              gap: 10,
            }}
          >

            {/* ── Expandable Pill ───────────────────────────────── */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 420, damping: 36, mass: 0.8, delay: walletOpen ? 0 : 0.08 }}
              style={{
                flex: 1,
                overflow: "hidden",
                borderRadius:         isRounded ? 999 : 24,
                background:           "rgba(255,255,255,0.88)",
                backdropFilter:       "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border:               "1px solid rgba(255,255,255,0.6)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.9)," +
                  "0 8px 32px rgba(0,0,0,0.09)," +
                  "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >

              {/* ── Wallet content (only rendered when open) ───── */}
              <AnimatePresence>
                {walletOpen && (
                  <motion.div
                    key="wallet-content"
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 480, damping: 38, delay: walletOpen ? 0.04 : 0 }}
                    style={{ padding: "18px 18px 14px" }}
                  >
                    {/* Balance */}
                    <div style={{
                      background: "#f5f5f5",
                      borderRadius: 16,
                      padding: "14px 16px",
                      marginBottom: 16,
                    }}>
                      <p style={{
                        fontSize: 10.5, fontWeight: 600,
                        color: "#9e9e9e", letterSpacing: "0.06em",
                        textTransform: "uppercase", marginBottom: 6,
                      }}>
                        Saldo Tersedia
                      </p>
                      <p style={{
                        fontSize: 28, fontWeight: 700,
                        color: "#0f0f0f", letterSpacing: "-0.03em",
                        lineHeight: 1,
                      }}>
                        {wallet ? formatIDR(wallet.availableBalance) : "—"}
                      </p>
                      {wallet && (
                        <p style={{ fontSize: 12, color: "#9e9e9e", marginTop: 6, lineHeight: 1 }}>
                          Escrow: {formatIDR(wallet.escrowBalance)}
                        </p>
                      )}
                    </div>

                    {/* 4 action buttons */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 8,
                      paddingBottom: 2,
                    }}>
                      {WALLET_ACTIONS.map((action, i) => {
                        const Icon = action.icon
                        return (
                          <motion.button
                            key={action.testId}
                            data-testid={action.testId}
                            onClick={() => goWallet(action.href)}
                            className="flex flex-col items-center"
                            style={{ gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                            whileTap={{ scale: 0.84 }}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 32, delay: 0.06 + i * 0.04 }}
                          >
                            <div style={{
                              width: "100%", aspectRatio: "1 / 1",
                              background: action.bg, borderRadius: 18,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <Icon size={26} weight="fill" style={{ color: action.color }} />
                            </div>
                            <span style={{
                              fontSize: 11, fontWeight: 500,
                              color: "#525252", lineHeight: 1.2, textAlign: "center",
                            }}>
                              {action.label}
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>

                    {/* Divider */}
                    <div style={{
                      height: 1,
                      background: "rgba(0,0,0,0.06)",
                      marginTop: 14,
                      marginLeft: -18,
                      marginRight: -18,
                    }} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Tab row (always visible) ──────────────────── */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  height: PILL_H,
                  padding: PAD,
                }}
              >
                {/* Sliding highlight — layoutId for buttery smooth slide */}
                {activeIndex >= 0 && (
                  <motion.span
                    layoutId="nav-highlight"
                    className="absolute rounded-full"
                    style={{
                      left:          `calc(${PAD}px + ${activeIndex} * (100% - ${PAD * 2}px) / 4)`,
                      width:         `calc((100% - ${PAD * 2}px) / 4)`,
                      height:        PILL_H - PAD * 2,
                      top:           PAD,
                      background:    "rgba(0,0,0,0.07)",
                      pointerEvents: "none",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.7 }}
                  />
                )}

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
                          lineHeight: 1, letterSpacing: "-0.01em",
                          transition: "color 0.15s",
                        }}>
                          {item.label}
                        </span>
                      </button>
                    </motion.div>
                  )
                })}
              </div>

            </motion.div>

            {/* ── FAB + ─────────────────────────────────────────── */}
            <motion.div
              whileTap={{ scale: 0.86 }}
              transition={{ type: "spring", stiffness: 600, damping: 28 }}
              style={{ flexShrink: 0 }}
            >
              <Link
                href={ROUTES.TRANSACTION_NEW}
                aria-label="Buat transaksi baru"
                data-testid="nav-plus"
                onClick={() => setWalletOpen(false)}
                className="flex items-center justify-center rounded-full"
                style={{
                  width: FAB_SIZE, height: FAB_SIZE,
                  background:           "rgba(255,255,255,0.88)",
                  backdropFilter:       "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border:               "1px solid rgba(255,255,255,0.6)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.9)," +
                    "0 8px 32px rgba(0,0,0,0.09)," +
                    "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <Plus size={22} weight="bold" style={{ color: INACTIVE }} />
              </Link>
            </motion.div>

          </div>
        </div>
      </nav>
    </>
  )
}
