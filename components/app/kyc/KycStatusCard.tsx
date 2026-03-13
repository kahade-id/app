"use client"

import { CheckCircle } from "@phosphor-icons/react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared"
import { KYC_STATUS_LABELS } from "@/lib/constants"
import type { KycStatus } from "@/types/auth"

interface KycStatusCardProps {
  status: KycStatus
}

export function KycStatusCard({ status }: KycStatusCardProps) {
  if (status === "APPROVED") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex size-20 items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
            <CheckCircle className="size-10 text-emerald-500" />
          </div>
          <h2 className="text-lg font-semibold">Akun Terverifikasi</h2>
          <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">Identitas Anda telah berhasil diverifikasi.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center py-12 text-center">
        <StatusBadge status="PENDING" label={KYC_STATUS_LABELS["PENDING"]} className="mb-4" />
        <h3 className="text-base font-semibold">Dokumen Sedang Direview</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">Tim kami sedang memeriksa dokumen Anda. Proses ini memakan waktu 1-3 hari kerja.</p>
      </CardContent>
    </Card>
  )
}
