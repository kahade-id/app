"use client"

import { memo } from "react"
import { formatIDR } from "@/lib/currency"
import type { FeeBreakdown } from "@/types/transaction"

interface FeeCalculatorProps {
  feeData: FeeBreakdown | null
  error?: string | null
}

// #33/#173 — Pure display component; memoize to avoid re-calculation on parent re-renders
export const FeeCalculator = memo(function FeeCalculator({ feeData, error }: FeeCalculatorProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (!feeData) return null

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Nilai Transaksi</span>
        <span className="font-semibold">{formatIDR(feeData.orderValue)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Biaya Platform ({(feeData.feeRate * 100).toFixed(1)}%)</span>
        <span>{formatIDR(feeData.feeAmount)}</span>
      </div>
      {feeData.voucherDiscount > 0 && (
        <div className="flex justify-between text-sm text-emerald-600">
          <span>Diskon Voucher</span>
          <span>-{formatIDR(feeData.voucherDiscount)}</span>
        </div>
      )}
      <div className="border-t pt-3 flex justify-between text-sm">
        <span className="text-muted-foreground">Biaya Pembeli</span>
        <span>{formatIDR(feeData.buyerFeeAmount)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Biaya Penjual</span>
        <span>{formatIDR(feeData.sellerFeeAmount)}</span>
      </div>
      <div className="border-t pt-3 flex justify-between font-semibold">
        <span>Total Pembeli Bayar</span>
        <span>{formatIDR(feeData.buyerPayAmount)}</span>
      </div>
      <div className="flex justify-between font-semibold">
        <span>Penjual Terima</span>
        <span>{formatIDR(feeData.sellerReceiveAmount)}</span>
      </div>
    </div>
  )
}
)
