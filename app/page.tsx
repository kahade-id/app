"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { SpinnerGap } from "@phosphor-icons/react"
import Image from "next/image"

import { CharacterBackground } from "@/components/public/CharacterBackground"
import { ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

function isLoggedIn(): boolean {
  if (typeof localStorage === "undefined") return false
  try {
    const raw = localStorage.getItem("kahade-auth")
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return parsed?.state?.isAuthenticated === true
  } catch {
    return false
  }
}

export default function SplashPage() {
  const router = useRouter()
  const [show, setShow] = useState(true)

  useEffect(() => {
    const tExit = setTimeout(() => setShow(false), 1500)
    const tNav  = setTimeout(
      () => router.replace(isLoggedIn() ? ROUTES.DASHBOARD : ROUTES.ONBOARDING),
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
      <CharacterBackground count={70} maxOpacity={0.10} />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, hsl(var(--background) / 0.92) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <AnimatePresence>
        {show && (
          <motion.div
            key="splash-logo"
            className="relative z-10 flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.88, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 1.04,  y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 0.68, 0, 1.15] }}
          >
            {/* Favicon dari public/ — tanpa shadow */}
            <div className={cn(
              "flex size-20 items-center justify-center",
              "rounded-2xl bg-primary"
            )}>
              <Image
                src="/favicon.svg"
                alt="Kahade"
                width={44}
                height={44}
                priority
                className="invert"
              />
            </div>

            {/* Deskripsi saja — tanpa duplikasi logo/teks Kahade */}
            <p className="text-sm font-light tracking-wide text-muted-foreground text-center">
              menjaga kepercayaan antara pembeli dan penjual.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

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
