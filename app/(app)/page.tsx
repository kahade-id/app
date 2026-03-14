"use client"

// ─── Splash Screen ─────────────────────────────────────────────────────────────
// Komponen yang dipakai (semua dari design system yang sudah ada):
//   - CharacterBackground → animasi latar belakang karakter
//   - AuthBranding        → logo Kahade, sama dengan halaman auth lain
//   - motion + AnimatePresence → framer-motion (dependency resmi)
//   - SpinnerGap          → icon spinner Phosphor, sama dengan LoadingState
//   - cn                  → class merging utility
//   - ROUTES              → konstanta route terpusat
//
// Flow: mount → 1.5s idle → exit animation → replace ke /beranda atau /onboarding

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { SpinnerGap, Shield } from "@phosphor-icons/react"

import { AuthBranding } from "@/components/auth/AuthBranding"
import { CharacterBackground } from "@/components/public/CharacterBackground"
import { ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

// ── Helper: cek cookie access_token (edge-safe, client-only) ─────────────────
function hasAccessToken(): boolean {
  if (typeof document === "undefined") return false
  return document.cookie.split(";").some((c) => c.trim().startsWith("access_token="))
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SplashPage() {
  const router  = useRouter()
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Minimum splash duration 1500ms, exit animation 250ms, lalu navigate
    const tExit = setTimeout(() => setShow(false), 1500)
    const tNav  = setTimeout(
      () => router.replace(hasAccessToken() ? ROUTES.DASHBOARD : ROUTES.ONBOARDING),
      1750
    )
    return () => { clearTimeout(tExit); clearTimeout(tNav) }
  }, [router])

  return (
    <div
      className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-background"
      aria-label="Memuat Kahade…"
      aria-live="polite"
    >
      {/* Background animasi karakter — lebih tipis dari onboarding */}
      <CharacterBackground count={70} maxOpacity={0.10} />

      {/* Radial vignette supaya logo terbaca di tengah */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, hsl(var(--background) / 0.92) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Logo + wordmark ────────────────────────────────────── */}
      <AnimatePresence>
        {show && (
          <motion.div
            key="splash-logo"
            className="relative z-10 flex flex-col items-center gap-5"
            initial={{ opacity: 0, scale: 0.88, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 1.04,  y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 0.68, 0, 1.15] }}
          >
            {/* Shield icon + pulse ring */}
            <div className="relative">
              {/* Pulse ring — menggunakan motion animate, tidak butuh CSS @keyframe baru */}
              <motion.span
                className="absolute inset-0 rounded-2xl bg-primary/15"
                animate={{ scale: [1, 1.22, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
                aria-hidden="true"
              />
              <div
                className={cn(
                  "relative flex size-20 items-center justify-center",
                  "rounded-2xl bg-primary text-primary-foreground shadow-xl"
                )}
              >
                <Shield className="size-10" weight="fill" aria-hidden="true" />
              </div>
            </div>

            {/* Branding — AuthBranding yang sudah konsisten */}
            <div className="flex flex-col items-center gap-1">
              <AuthBranding />
              <p className="text-sm font-light tracking-wide text-muted-foreground">
                Escrow P2P yang Aman
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Spinner bawah — SpinnerGap konsisten dengan LoadingState ── */}
      <motion.div
        className="absolute bottom-16 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        aria-hidden="true"
      >
        <SpinnerGap className="size-5 animate-spin text-muted-foreground/40" />
      </motion.div>
    </div>
  )
}
