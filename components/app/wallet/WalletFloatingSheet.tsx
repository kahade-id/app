"use client"

import { useRouter } from "next/navigation"
import {
  ArrowCircleUp,
  ArrowCircleDown,
  Clock,
  DotsThree,
} from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"
import { formatIDR } from "@/lib/currency"
import { useWallet } from "@/lib/hooks/use-wallet"
import { ROUTES } from "@/lib/constants"

// ─── Geometry (must stay in sync with AppBottomNav constants) ─
// Exported so AppBottomNav can import without duplication
export const PILL_H  = 58   // ITEM_H(48) + PAD(5)*2
export const PAD_X   = 16   // horizontal screen padding
export const PB      = 16   // bottom padding

// ─── 4 wallet actions ─────────────────────────────────────────
const ACTIONS = [
  {
    label:     "Top Up",
    href:      ROUTES.WALLET_TOPUP,
    icon:      ArrowCircleUp,
    bg:        "#e6f7ee",
    color:     "#16a34a",
    testId:    "ws-topup",
  },
  {
    label:     "Tarik Dana",
    href:      ROUTES.WALLET_WITHDRAW,
    icon:      ArrowCircleDown,
    bg:        "#fff2e8",
    color:     "#ea580c",
    testId:    "ws-withdraw",
  },
  {
    label:     "Riwayat",
    href:      ROUTES.WALLET_HISTORY,
    icon:      Clock,
    bg:        "#e8f0fe",
    color:     "#3b5bdb",
    testId:    "ws-history",
  },
  {
    label:     "Detail",
    href:      ROUTES.WALLET,
    icon:      DotsThree,
    bg:        "#f2f2f2",
    color:     "#525252",
    testId:    "ws-detail",
  },
]

interface WalletFloatingSheetProps {
  open:    boolean
  onClose: () => void
}

export function WalletFloatingSheet({ open, onClose }: WalletFloatingSheetProps) {
  const router         = useRouter()
  const { data: wallet } = useWallet()

  // Total distance from bottom screen edge to top of pill
  // = env(safe-area-inset-bottom) handled by parent, so here we just use fixed offset
  const BOTTOM_POS = PB + PILL_H + 8  // 8px gap between sheet and pill

  function go(href: string) {
    onClose()
    router.push(href)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Scrim ──────────────────────────────────────────── */}
          <motion.div
            key="ws-scrim"
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.22)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ── Sheet ──────────────────────────────────────────── */}
          <motion.div
            key="ws-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Menu Dompet"
            className="fixed z-50"
            style={{
              left:   PAD_X,
              right:  PAD_X,
              bottom: BOTTOM_POS,
            }}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 14, scale: 0.97 }}
            transition={{
              type:      "spring",
              stiffness: 480,
              damping:   38,
              mass:      0.75,
            }}
          >
            <div
              style={{
                borderRadius: 28,
                overflow: "hidden",
                // Slightly more opaque than navbar pill so content is readable
                background:           "rgba(255,255,255,0.96)",
                backdropFilter:       "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                // Top shadow strong, bottom subtle — creates "floating above navbar" feel
                boxShadow:
                  "0 -1px 0 rgba(255,255,255,0.8) inset," +
                  "0 20px 56px rgba(0,0,0,0.13)," +
                  "0 4px 16px rgba(0,0,0,0.07)," +
                  "0 1px 0 rgba(0,0,0,0.04)",
                border: "1px solid rgba(255,255,255,0.7)",
              }}
            >
              {/* Drag pill indicator */}
              <div className="flex justify-center" style={{ paddingTop: 10, paddingBottom: 4 }}>
                <div
                  style={{
                    width: 32, height: 4,
                    borderRadius: 999,
                    background: "#e0e0e0",
                  }}
                />
              </div>

              <div style={{ padding: "10px 18px 20px" }}>

                {/* ── Balance ──────────────────────────────── */}
                <div
                  style={{
                    background:   "#f6f6f6",
                    borderRadius: 18,
                    padding:      "14px 16px",
                    marginBottom: 16,
                  }}
                >
                  <p style={{
                    fontSize: 10.5, fontWeight: 600,
                    color: "#9e9e9e", letterSpacing: "0.06em",
                    textTransform: "uppercase", marginBottom: 6,
                  }}>
                    Saldo Tersedia
                  </p>
                  <p style={{
                    fontSize: 26, fontWeight: 700,
                    color: "#0f0f0f", letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}>
                    {wallet ? formatIDR(wallet.availableBalance) : "—"}
                  </p>
                  {wallet && (
                    <p style={{
                      fontSize: 12, color: "#757575",
                      marginTop: 6, lineHeight: 1,
                    }}>
                      Dana Escrow: {formatIDR(wallet.escrowBalance)}
                    </p>
                  )}
                </div>

                {/* ── 4 Actions ────────────────────────────── */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 10,
                  }}
                >
                  {ACTIONS.map((action, i) => {
                    const Icon = action.icon
                    return (
                      <motion.button
                        key={action.testId}
                        data-testid={action.testId}
                        onClick={() => go(action.href)}
                        className="flex flex-col items-center"
                        style={{ gap: 7, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        whileTap={{ scale: 0.84 }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 32,
                          delay: 0.04 + i * 0.04,
                        }}
                      >
                        {/* Icon tile */}
                        <div style={{
                          width: "100%",
                          aspectRatio: "1 / 1",
                          background:   action.bg,
                          borderRadius: 20,
                          display:      "flex",
                          alignItems:   "center",
                          justifyContent: "center",
                        }}>
                          <Icon size={26} weight="fill" style={{ color: action.color }} />
                        </div>
                        {/* Label */}
                        <span style={{
                          fontSize:   11.5,
                          fontWeight: 500,
                          color:      "#525252",
                          lineHeight: 1.2,
                          textAlign:  "center",
                        }}>
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
