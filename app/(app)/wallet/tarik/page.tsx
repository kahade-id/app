"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader, LoadingState, ErrorState, PageTransition } from "@/components/shared"
import { toast } from "sonner"
import { useWithdraw, useConfirmWithdrawOtp, useWallet } from "@/lib/hooks/use-wallet"
import { useBankAccounts } from "@/lib/hooks/use-bank-accounts"
import { withdrawSchema } from "@/lib/validations/wallet.schema"
import { formatIDR } from "@/lib/currency"
import { ROUTES } from "@/lib/constants"
import { WithdrawForm, WithdrawOtpStep } from "@/components/app/wallet/WithdrawModal"
import type { WithdrawInitiationResponse } from "@/lib/services/wallet.service"

export default function TarikDanaPage() {
  const router = useRouter()
  const [step, setStep] = React.useState<"form" | "otp">("form")
  const [amount, setAmount] = React.useState(0)
  const [bankAccountId, setBankAccountId] = React.useState("")
  const [pin, setPin] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [txId, setTxId] = React.useState<string | null>(null)

  const { data: accounts, isLoading: accountsLoading, isError: accountsError, refetch } = useBankAccounts()
  // #066 FIX: Load wallet balance so user knows how much they can withdraw
  const { data: wallet } = useWallet()
  const withdrawMutation = useWithdraw()
  const confirmOtpMutation = useConfirmWithdrawOtp()

  const handleWithdraw = () => {
    // #11 FIX: Validasi semua field termasuk PIN lewat withdrawSchema (Zod)
    // agar tidak ada divergensi antara manual check dan schema validation
    const parsed = withdrawSchema.safeParse({ amount, bankAccountId, pin })
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Data tidak valid")
      return
    }

    withdrawMutation.mutate(
      { amount, bankAccountId, pin },
      {
        onSuccess: ({ data: res }) => {
          // #12 FIX: Gunakan WithdrawInitiationResponse yang sudah di-typed dengan benar
          // daripada type assertion `(res.data as { txId?: string })?.txId`
          const responseData = res.data as WithdrawInitiationResponse | undefined
          const txIdFromResponse = responseData?.txId
          if (txIdFromResponse) {
            setTxId(txIdFromResponse)
            setStep("otp")
          } else {
            toast.error("Gagal mendapatkan ID transaksi. Silakan coba lagi.")
          }
        },
      }
    )
  }

  const handleConfirmOtp = () => {
    if (otp.length !== 6 || !txId) return
    confirmOtpMutation.mutate(
      { otp, txId },
      { onSuccess: () => router.push(ROUTES.WALLET) }
    )
  }

  if (accountsLoading) return <LoadingState fullPage text="Memuat rekening bank..." />
  if (accountsError) return <ErrorState title="Gagal Memuat Rekening" onRetry={() => refetch()} />

  return (
    <PageTransition>
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Kembali" className="shrink-0 rounded-xl border border-border bg-muted hover:bg-muted/80" onClick={() => router.push(ROUTES.WALLET)} data-testid="button-withdraw-back">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0">
            <PageHeader title="Tarik Dana" description="Tarik saldo ke rekening bank Anda" />
          </div>
        </div>

        {/* BUG-008 FIX: wallet.balance doesn't exist in Wallet type — use availableBalance */}
        {wallet && (
          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Saldo tersedia</span>
                <span className="text-base font-semibold">{formatIDR(wallet.availableBalance)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "form" && (
          <WithdrawForm
            amount={amount}
            onAmountChange={setAmount}
            bankAccountId={bankAccountId}
            onBankAccountChange={setBankAccountId}
            pin={pin}
            onPinChange={setPin}
            accounts={accounts ?? []}
            onSubmit={handleWithdraw}
            isPending={withdrawMutation.isPending}
            onNavigateToBank={() => router.push(ROUTES.PROFILE_BANK)}
            maxAmount={wallet?.availableBalance}
          />
        )}

        {step === "otp" && (
          <WithdrawOtpStep
            otp={otp}
            onOtpChange={setOtp}
            onConfirm={handleConfirmOtp}
            isPending={confirmOtpMutation.isPending}
          />
        )}
      </div>
    </PageTransition>
  )
}
