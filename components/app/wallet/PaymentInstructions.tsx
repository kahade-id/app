"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CopyButton } from "@/components/shared"
import { formatIDR } from "@/lib/currency"
import { formatDateTime } from "@/lib/date"
import type { TopUpResponse } from "@/types/wallet"

interface PaymentInstructionsProps {
  data: TopUpResponse
}

export function PaymentInstructions({ data }: PaymentInstructionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Instruksi Pembayaran</CardTitle>
        <CardDescription>Selesaikan pembayaran sebelum batas waktu</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Jumlah</span>
            <span className="font-semibold">{formatIDR(data.amount)}</span>
          </div>

          {data.vaNumber && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Nomor Virtual Account</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">{data.vaNumber}</span>
                <CopyButton value={data.vaNumber} />
              </div>
            </div>
          )}

          {data.vaBank && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bank</span>
              <span className="font-medium">{data.vaBank}</span>
            </div>
          )}

          {data.expiresAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Batas Waktu</span>
              <span className="text-sm font-medium text-destructive">{formatDateTime(data.expiresAt)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
