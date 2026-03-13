"use client"

import * as React from "react"
import { ArrowLineDown, Buildings, Lock } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CurrencyInput, OTPInput, EmptyState } from "@/components/shared"
import { formatIDR } from "@/lib/currency"
import type { BankAccount } from "@/types/bank-account"

interface WithdrawFormProps {
  amount: number
  onAmountChange: (amount: number) => void
  bankAccountId: string
  onBankAccountChange: (id: string) => void
  pin: string
  onPinChange: (pin: string) => void
  accounts: BankAccount[]
  onSubmit: () => void
  isPending: boolean
  onNavigateToBank: () => void
  // BUG-009 FIX: Added maxAmount prop so caller can pass wallet.availableBalance
  maxAmount?: number
}

export function WithdrawForm({
  amount,
  onAmountChange,
  bankAccountId,
  onBankAccountChange,
  pin,
  onPinChange,
  accounts,
  onSubmit,
  isPending,
  onNavigateToBank,
  maxAmount,
}: WithdrawFormProps) {
  if (!accounts?.length) {
    return (
      <EmptyState
        title="Belum Ada Rekening Bank"
        description="Tambahkan rekening bank terlebih dahulu untuk melakukan penarikan."
        icon={<Buildings className="size-8" />}
        action={<Button onClick={onNavigateToBank} data-testid="button-navigate-to-bank">Tambah Rekening</Button>}
      />
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted">
              <ArrowLineDown className="size-4 text-foreground/70" />
            </div>
            Jumlah Penarikan
          </CardTitle>
          <CardDescription>Minimal penarikan Rp 50.000</CardDescription>
        </CardHeader>
        <CardContent>
          <CurrencyInput value={amount} onChange={onAmountChange} min={50000} max={maxAmount} data-testid="input-withdraw-amount" />
          {maxAmount !== undefined && (
            <p className="mt-2 text-xs text-muted-foreground">
              Saldo tersedia: {formatIDR(maxAmount)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted">
              <Buildings className="size-4 text-foreground/70" />
            </div>
            Rekening Tujuan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={bankAccountId} onValueChange={onBankAccountChange}>
            <SelectTrigger data-testid="select-bank-account"><SelectValue placeholder="Pilih rekening bank" /></SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.bankName} - {acc.accountNumber} ({acc.accountName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted">
              <Lock className="size-4 text-foreground/70" />
            </div>
            PIN Wallet
          </CardTitle>
          <CardDescription>Masukkan PIN 6 digit wallet Anda untuk verifikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* CQ-008 FIX: Added htmlFor to associate label with OTPInput (id="pin-wallet") */}
          <label htmlFor="pin-wallet" className="block text-sm font-medium text-muted-foreground">PIN Wallet</label>
          <div className="flex justify-center py-2">
            {/* UX-013 FIX: Disable OTPInput when mutation is pending so user can't change PIN mid-request */}
            <OTPInput id="pin-wallet" value={pin} onChange={onPinChange} length={6} disabled={isPending} />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" disabled={!amount || !bankAccountId || pin.length !== 6 || isPending} onClick={onSubmit} data-testid="button-submit-withdraw">
        {isPending ? "Memproses..." : `Tarik ${amount > 0 ? formatIDR(amount) : ""}`}
      </Button>
    </>
  )
}

interface WithdrawOtpStepProps {
  otp: string
  onOtpChange: (otp: string) => void
  onConfirm: () => void
  isPending: boolean
}

export function WithdrawOtpStep({ otp, onOtpChange, onConfirm, isPending }: WithdrawOtpStepProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Verifikasi OTP</CardTitle>
        <CardDescription>Masukkan kode OTP yang dikirim ke email Anda</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          {/* CQ-008 FIX: Added htmlFor to associate label with OTPInput */}
          <label htmlFor="withdraw-otp" className="block text-sm font-medium text-muted-foreground">Kode OTP</label>
          <div className="flex justify-center py-2">
            <OTPInput id="withdraw-otp" value={otp} onChange={onOtpChange} length={6} />
          </div>
        </div>
        <Button className="w-full" disabled={otp.length !== 6 || isPending} onClick={onConfirm} data-testid="button-confirm-withdraw-otp">
          {isPending ? "Memverifikasi..." : "Konfirmasi Penarikan"}
        </Button>
      </CardContent>
    </Card>
  )
}
