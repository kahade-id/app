"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Warning, ShieldCheck, XCircle, Clock } from "@phosphor-icons/react"
import { useAuthStore } from "@/lib/stores/auth.store"
import { useMe } from "@/lib/hooks/use-user"
import { ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

const KYC_CONFIG: Record<
  string,
  {
    icon: React.ElementType
    title: string
    description: string
    actionLabel: string
    variant: string
  }
> = {
  UNVERIFIED: {
    icon: Warning,
    title: "Verifikasi Identitas Diperlukan",
    description:
      "Lengkapi verifikasi KYC untuk mengakses semua fitur termasuk transaksi dan penarikan dana.",
    actionLabel: "Verifikasi Sekarang",
    variant: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200",
  },
  PENDING: {
    icon: Clock,
    title: "Verifikasi Sedang Diproses",
    description:
      "Dokumen KYC Anda sedang ditinjau. Proses ini biasanya memakan waktu 1-2 hari kerja.",
    actionLabel: "Lihat Status",
    variant: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200",
  },
  REJECTED: {
    icon: XCircle,
    title: "Verifikasi Ditolak",
    description:
      "Dokumen KYC Anda ditolak. Silakan periksa alasan penolakan dan ajukan ulang.",
    actionLabel: "Ajukan Ulang",
    variant: "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200",
  },
  REVOKED: {
    icon: XCircle,
    title: "Verifikasi Dicabut",
    description:
      "Status verifikasi KYC Anda telah dicabut. Hubungi dukungan untuk informasi lebih lanjut.",
    actionLabel: "Hubungi Dukungan",
    variant: "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200",
  },
}

// L-13 FIX: KycBanner now polls useMe() every 30 seconds and syncs kycStatus into
// the auth store via updateUser(). When KYC is approved while the app is open, the
// banner will disappear automatically (within one 30s polling cycle) without requiring
// a page reload or re-login. Polling stops automatically when the banner unmounts
// (i.e. after kycStatus === "APPROVED" is written to the auth store).
export function KycBanner() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

  const { data: freshUser } = useMe({ refetchInterval: 30_000 })

  useEffect(() => {
    if (freshUser?.kycStatus && freshUser.kycStatus !== user?.kycStatus) {
      updateUser({ kycStatus: freshUser.kycStatus })
    }
  }, [freshUser?.kycStatus, user?.kycStatus, updateUser])

  if (!user) return null
  if (user.kycStatus === "APPROVED") return null

  const config = KYC_CONFIG[user.kycStatus]
  if (!config) return null

  const Icon = config.icon
  const href =
    user.kycStatus === "REVOKED" ? ROUTES.HELP : ROUTES.PROFILE_KYC

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        config.variant
      )}
    >
      <Icon className="size-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{config.title}</p>
        <p className="text-sm mt-0.5 opacity-90">{config.description}</p>
      </div>
      <Link
        href={href}
        className="shrink-0 text-sm font-medium underline underline-offset-4 hover:opacity-80 whitespace-nowrap"
        data-testid="link-kyc-banner-action"
      >
        {config.actionLabel}
      </Link>
    </div>
  )
}
