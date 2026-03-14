"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, LockKey, Handshake, CurrencyCircleDollar } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuthBranding } from "@/components/auth/AuthBranding"
import { StaggerContainer, StaggerItem } from "@/components/shared"
import { CharacterBackground } from "@/components/public/CharacterBackground"
import { cn } from "@/lib/utils"

const FEATURES = [
  { icon: LockKey,              label: "Dana Tersimpan Aman"  },
  { icon: Handshake,            label: "Terlindungi Kontrak"  },
  { icon: CurrencyCircleDollar, label: "Cair Instan"          },
] as const

export default function OnboardingPage() {
  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-background select-none">
      <CharacterBackground />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%]"
        style={{
          background:
            "linear-gradient(to top, hsl(var(--background)) 55%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Logo */}
        <motion.header
          className="px-6 pt-14"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <AuthBranding />
        </motion.header>

        <div className="flex-1" aria-hidden="true" />

        {/* Hero */}
        <StaggerContainer className="px-6">
          {/* Favicon icon — konsisten dengan splash */}
          <StaggerItem>
            <div className={cn(
              "mb-6 inline-flex size-16 items-center justify-center",
              "rounded-2xl bg-primary"
            )}>
              <Image
                src="/favicon.svg"
                alt=""
                width={36}
                height={36}
                priority
                className="invert"
                aria-hidden="true"
              />
            </div>
          </StaggerItem>

          {/* Headline */}
          <StaggerItem>
            <h1 className="text-[2.4rem] leading-[1.08] font-light tracking-tight text-foreground">
              Transaksi Aman,
              <br />
              <strong className="font-bold italic">Tanpa Rasa Khawatir.</strong>
            </h1>
          </StaggerItem>

          {/* Deskripsi */}
          <StaggerItem>
            <p className="mt-4 max-w-[290px] text-base leading-relaxed text-muted-foreground">
              Dana Anda dijaga sampai transaksi selesai.{" "}
              Pembeli pasti bayar. Penjual pasti kirim.{" "}
              <span className="text-foreground font-medium">
                Kepercayaan bukan soal harapan — tapi jaminan.
              </span>
            </p>
          </StaggerItem>

          {/* Feature pills */}
          <StaggerItem>
            <div className="mt-5 flex flex-wrap gap-2">
              {FEATURES.map(({ icon: Icon, label }) => (
                <Badge
                  key={label}
                  variant="outline"
                  className="gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-background/70 backdrop-blur-sm"
                >
                  <Icon className="size-3.5 text-muted-foreground" weight="bold" aria-hidden="true" />
                  {label}
                </Badge>
              ))}
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* CTA */}
        <motion.div
          className="px-6 pb-10 pt-8 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, duration: 0.45, ease: "easeOut" }}
        >
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

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full h-14 rounded-2xl text-base font-semibold bg-background/60 backdrop-blur-sm active:scale-[0.98] transition-transform"
          >
            <Link href="/register">Buat Akun Baru</Link>
          </Button>

          <p className="pt-1 text-center text-[11px] leading-relaxed text-muted-foreground">
            Dengan melanjutkan, Anda menyetujui{" "}
            <Link href="/syarat" className="underline underline-offset-2 transition-colors hover:text-foreground">
              Syarat &amp; Ketentuan
            </Link>{" "}
            dan{" "}
            <Link href="/privasi" className="underline underline-offset-2 transition-colors hover:text-foreground">
              Kebijakan Privasi
            </Link>{" "}
            Kahade.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
