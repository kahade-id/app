"use client"

import { useRouter } from "next/navigation"
import {
  ArrowCircleUp,
  ArrowCircleDown,
  ClockCounterClockwise,
  LockKey,
  ArrowUpRight,
  type Icon,
} from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"
import { formatIDR } from "@/lib/currency"
import { useWallet } from "@/lib/hooks/use-wallet"
import { ROUTES } from "@/lib/constants"

// ── Action grid config ──────────────────────────────────────
interface WalletAction {
  label:   string
  href:    string
  icon:    Icon
  iconBg:  string  // background fill of the icon tile
  iconColor: string
  testId:  string
}

const ACTIONS: WalletAction[] = [
  {
    label:     "Top Up",
    href:      ROUTES.WALLET_TOPUP,
    icon:      ArrowCircleUp,
    iconBg:    "#e8f8f1",
    iconColor: "#16a34a",
    testId:    "wallet-sheet-topup",
  },
  {
    label:     "Tarik Dana",
    href:      ROUTES.WALLET_WITHDRAW,
    icon:      ArrowCircleDown,
    iconBg:    "#fff3e8",
    iconColor: "#ea580c",
    testId:    "wallet-sheet-withdraw",
  },
  {
    label:     "Riwayat",
    href:      ROUTES.WALLET_HISTORY,
    icon:      ClockCounterClockwise,
    iconBg:    "#eaf1ff",
    iconColor: "#3b82f6",
    testId:    "wallet-sheet-history",
  },
  {
    label:     "PIN Wallet",
    href:      ROUTES.WALLET,
    icon:      LockKey,
    iconBg:    "#f3eeff",
    iconColor: "#7c3aed",
    testId:    "wallet-sheet-pin",
  },
  {
    label:     "Detail",
    href:      ROUTES.WALLET,
    icon:      ArrowUpRight,
    iconBg:    "#f4f4f4",
    iconColor: "#525252",
    testId:    "wallet-sheet-detail",
  },
]

// ── Spring presets ──────────────────────────────────────────
const SHEET_SPRING = { type: "spring" as const, stiffness: 440, damping: 38, mass: 0.8 }
const ITEM_SPRING  = { type: "spring" as const, stiffness: 500, damping: 32 }

interface WalletFloatingSheetProps {
  open:    boolean
  onClose: () => void
  /** Offset in px above which the sheet sits (= pill height + gap) */
  bottomOffset: number
}

export function WalletFloatingSheet({ open, onClose, bottomOffset }: WalletFloatingSheetProps) {
  const router  = useRouter()
  const { data: wallet } = useWallet()

  function navigate(href: string) {
    onClose()
    router.push(href)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Tap-outside backdrop ───────────────────────── */}
          <motion.div
            key="wallet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.18)" }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ── Floating sheet ────────────────────────────── */}
          <motion.div
            key="wallet-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Menu Dompet"
            className="fixed left-4 right-4 z-50"
            style={{ bottom: bottomOffset }}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 20, scale: 0.97 }}
            transition={SHEET_SPRING}
          >
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.97)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                boxShadow:
                  "0 -2px 0 rgba(0,0,0,0.04)," +
                  "0 16px 48px rgba(0,0,0,0.12)," +
                  "0 4px 12px rgba(0,0,0,0.06)",
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div
                  className="rounded-full"
                  style={{ width: 36, height: 4, background: "#e0e0e0" }}
                />
              </div>

              <div style={{ padding: "12px 20px 20px" }}>
                {/* ── Balance section ───────────────────── */}
                <div
                  className="rounded-2xl mb-4"
                  style={{
                    padding: "14px 16px",
                    background: "#f7f7f7",
                  }}
                >
                  <p
                    className="leading-none mb-1"
                    style={{ fontSize: 11, fontWeight: 500, color: "#9e9e9e", letterSpacing: "0.02em" }}
                  >
                    SALDO TERSEDIA
                  </p>
                  <p
                    className="leading-none font-bold"
                    style={{ fontSize: 24, color: "#0f0f0f", letterSpacing: "-0.03em" }}
                  >
                    {wallet ? formatIDR(wallet.availableBalance) : "—"}
                  </p>
                  {wallet && (
                    <p
                      className="leading-none mt-2"
                      style={{ fontSize: 12, color: "#757575" }}
                    >
                      Dana Escrow: {formatIDR(wallet.escrowBalance)}
                    </p>
                  )}
                </div>

                {/* ── Action grid ───────────────────────── */}
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: 8,
                  }}
                >
                  {ACTIONS.map((action, i) => {
                    const ActionIcon = action.icon
                    return (
                      <motion.button
                        key={action.testId}
                        data-testid={action.testId}
                        onClick={() => navigate(action.href)}
                        className="flex flex-col items-center"
                        style={{ gap: 6 }}
                        whileTap={{ scale: 0.86 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...ITEM_SPRING, delay: i * 0.035 }}
                      >
                        {/* Icon tile */}
                        <div
                          className="flex items-center justify-center rounded-2xl"
                          style={{
                            width: 52,
                            height: 52,
                            background: action.iconBg,
                            flexShrink: 0,
                          }}
                        >
                          <ActionIcon
                            size={24}
                            weight="fill"
                            style={{ color: action.iconColor }}
                          />
                        </div>
                        {/* Label */}
                        <span
                          className="leading-tight text-center"
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: "#525252",
                            maxWidth: 56,
                            wordBreak: "break-word",
                          }}
                        >
                          {action.label}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
