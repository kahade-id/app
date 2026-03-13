"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface KycRejectedCardProps {
  rejectionReason: string
  // #7 FIX: Tambah prop onResubmit untuk memulai proses resubmit KYC
  onResubmit?: () => void
  isResubmitting?: boolean
}

export function KycRejectedCard({ rejectionReason, onResubmit, isResubmitting }: KycRejectedCardProps) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="flex items-start gap-3 py-4">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5">
          <span className="text-xs font-bold text-destructive">!</span>
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm font-medium text-destructive">Alasan Penolakan:</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{rejectionReason}</p>
          </div>
          {onResubmit && (
            <Button
              size="sm"
              onClick={onResubmit}
              disabled={isResubmitting}
              className="w-full"
              data-testid="button-resubmit-kyc"
            >
              {isResubmitting ? "Mengajukan ulang..." : "Ajukan Ulang KYC"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
