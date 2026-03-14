"use client"

// ─── Onboarding Page ──────────────────────────────────────────────────────────
// Komponen yang dipakai (semua dari design system yang sudah ada):
//   - CharacterBackground → animasi latar belakang keuangan
//   - AuthBranding        → logo Kahade, konsisten dengan halaman auth
//   - Button              → CTA via design system (variant/size)
//   - Badge               → feature pills (variant="outline")
//   - StaggerContainer    → animasi entrance bertahap (framer-motion)
//   - StaggerItem         → item dalam stagger
//   - motion              → framer-motion (dependency resmi)
//   - cn                  → class merging utility
//   - Phosphor icons      → icon library standar project

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  LockKey,
  Handshake,
  CurrencyCircleDollar,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuthBranding } from "@/components/auth/AuthBranding"
import { StaggerContainer, StaggerItem } from "@/components/shared"
import { CharacterBackground } from "@/components/public/CharacterBackground"
import { cn } from "@/lib/utils"

// ── Feature pills ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: LockKey,              label: "Dana Tersimpan Aman"  },
  { icon: Handshake,            label: "Terlindungi Kontrak"  },
  { icon: CurrencyCircleDollar, label: "Cair Instan"          },
] as const

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-background select-none">

      {/* Background animasi karakter */}
      <CharacterBackground />

      {/* Gradient bawah — supaya CTA tetap terbaca di atas karakter */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%]"
        style={{
          background:
            "linear-gradient(to top, hsl(var(--background)) 55%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Konten utama ──────────────────────────────────────── */}
      <div className="relative z-10 flex h-full flex-col">

        {/* Logo kiri atas */}
        <motion.header
          className="px-6 pt-14"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <AuthBranding />
        </motion.header>

        {/* Spacer — dorong hero ke bawah */}
        <div className="flex-1" aria-hidden="true" />

        {/* ── Hero: ikon + headline + pills ─────────────────── */}
        <StaggerContainer className="px-6">

          {/* Shield icon — pakai warna primary dari design system */}
          <StaggerItem>
            <div
              className={cn(
                "mb-6 inline-flex size-16 items-center justify-center",
                "rounded-2xl bg-primary text-primary-foreground shadow-lg"
              )}
            >
              <LockKey className="size-8" weight="fill" aria-hidden="true" />
            </div>
          </StaggerItem>

          {/* Headline — h1/h2 pakai font-serif sesuai CSS global */}
          <StaggerItem>
            <h1 className="text-[2.4rem] leading-[1.08] font-light tracking-tight text-foreground">
              Transaksi P2P
              <br />
              <strong className="font-bold italic">Tanpa Khawatir</strong>
            </h1>
          </StaggerItem>

          {/* Deskripsi */}
          <StaggerItem>
            <p className="mt-3 max-w-[270px] text-base leading-relaxed text-muted-foreground">
              Dana Anda dijaga netral hingga transaksi selesai dan kedua pihak sepakat.
            </p>
          </StaggerItem>

          {/* Feature pills — Badge outline dari design system */}
          <StaggerItem>
            <div className="mt-5 flex flex-wrap gap-2">
              {FEATURES.map(({ icon: Icon, label }) => (
                <Badge
                  key={label}
                  variant="outline"
                  className="gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-background/70 backdrop-blur-sm"
                >
                  <Icon
                    className="size-3.5 text-muted-foreground"
                    weight="bold"
                    aria-hidden="true"
                  />
                  {label}
                </Badge>
              ))}
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* ── CTA section ───────────────────────────────────── */}
        <motion.div
          className="px-6 pb-10 pt-8 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, duration: 0.45, ease: "easeOut" }}
        >
          {/* Masuk — Button default (primary) */}
          <Button
            asChild
            size="lg"
            className="w-full h-14 rounded-2xl text-base font-semibold group active:scale-[0.98] transition-transform"
          >
            <Link href="/login">
              Masuk ke Akun
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                weight="bold"
                aria-hidden="true"
              />
            </Link>
          </Button>

          {/* Daftar — Button outline */}
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full h-14 rounded-2xl text-base font-semibold bg-background/60 backdrop-blur-sm active:scale-[0.98] transition-transform"
          >
            <Link href="/register">Buat Akun Baru</Link>
          </Button>

          {/* Legal */}
          <p className="pt-1 text-center text-[11px] leading-relaxed text-muted-foreground">
            Dengan melanjutkan, Anda menyetujui{" "}
            <Link
              href="/syarat"
              className="underline underline-offset-2 transition-colors hover:text-foreground"
            >
              Syarat &amp; Ketentuan
            </Link>{" "}
            dan{" "}
            <Link
              href="/privasi"
              className="underline underline-offset-2 transition-colors hover:text-foreground"
            >
              Kebijakan Privasi
            </Link>{" "}
            Kahade.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
