"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { PageHeader, PageTransition, ConfirmDialog } from "@/components/shared"
import { useTopUp, useCancelTopUp, useWallet } from "@/lib/hooks/use-wallet"
import { formatIDR } from "@/lib/currency"
import { ROUTES } from "@/lib/constants"
import { TopUpModal } from "@/components/app/wallet/TopUpModal"
import { PaymentInstructions } from "@/components/app/wallet/PaymentInstructions"
import type { TopUpResponse } from "@/types/wallet"

export default function TopUpPage() {
  const router = useRouter()
  const [amount, setAmount] = React.useState(0)
  const [method, setMethod] = React.useState("")
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false)
  const [paymentData, setPaymentData] = React.useState<TopUpResponse | null>(null)
  const topUpMutation = useTopUp()
  const cancelTopUpMutation = useCancelTopUp()
  const { data: wallet, isError: walletError } = useWallet()

  const handleSubmit = () => {
    if (!amount || !method) return
    setShowConfirm(true)
  }

  const handleConfirmed = () => {
    setShowConfirm(false)
    topUpMutation.mutate(
      { amount, method },
      {
        onSuccess: ({ data: res }) => {
          if (res.data) {
            setPaymentData(res.data)
          } else {
            router.push(ROUTES.WALLET)
          }
        },
      }
    )
  }

  const handleCancelTopUp = () => {
    if (!paymentData) return
    cancelTopUpMutation.mutate(paymentData.transactionId, {
      onSuccess: () => {
        setPaymentData(null)
        setAmount(0)
        setMethod("")
      },
    })
  }

  if (paymentData) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-lg space-y-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Kembali ke Wallet"
              className="shrink-0 rounded-xl border border-border bg-muted hover:bg-muted/80"
              onClick={() => router.push(ROUTES.WALLET)}
              data-testid="button-topup-payment-back"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="min-w-0">
              <PageHeader title="Instruksi Pembayaran" description="Selesaikan pembayaran untuk top up wallet Anda" />
            </div>
          </div>

          <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20 py-0">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Permintaan berhasil dikirim</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">Selesaikan pembayaran sesuai instruksi di bawah</p>
              </div>
            </CardContent>
          </Card>

          <PaymentInstructions data={paymentData} />

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/5 hover:text-destructive"
              onClick={() => setShowCancelConfirm(true)}
              disabled={cancelTopUpMutation.isPending}
              data-testid="button-cancel-topup"
            >
              {cancelTopUpMutation.isPending ? "Membatalkan..." : "Batalkan Top Up"}
            </Button>
            <Button className="flex-1" onClick={() => router.push(ROUTES.WALLET)} data-testid="button-topup-done">
              Selesai
            </Button>
          </div>
        </div>

        <ConfirmDialog
          open={showCancelConfirm}
          onOpenChange={setShowCancelConfirm}
          title="Batalkan Top Up?"
          description="Permintaan top up ini akan dibatalkan. Dana tidak akan dikurangi jika Anda belum melakukan pembayaran."
          confirmLabel="Ya, Batalkan"
          variant="destructive"
          onConfirm={handleCancelTopUp}
          isLoading={cancelTopUpMutation.isPending}
          confirmTestId="button-confirm-cancel-topup"
          cancelTestId="button-cancel-cancel-topup"
        />
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Kembali" className="shrink-0 rounded-xl border border-border bg-muted hover:bg-muted/80" onClick={() => router.push(ROUTES.WALLET)} data-testid="button-topup-back">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0">
            <PageHeader title="Top Up Wallet" description="Isi saldo wallet Anda" />
          </div>
        </div>

        {wallet && (
          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Saldo saat ini</span>
                <span className="text-base font-semibold">{formatIDR(wallet.availableBalance)}</span>
              </div>
            </CardContent>
          </Card>
        )}
        {walletError && (
          <p className="text-sm text-destructive">Gagal memuat saldo wallet. Data mungkin tidak akurat.</p>
        )}

        <TopUpModal
          amount={amount}
          onAmountChange={setAmount}
          method={method}
          onMethodChange={setMethod}
          onSubmit={handleSubmit}
          isPending={topUpMutation.isPending}
        />
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Top Up</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan melakukan top up sebesar <strong>{formatIDR(amount)}</strong>.
              Lanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-topup-confirm">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmed} disabled={topUpMutation.isPending} data-testid="button-confirm-topup">
              {topUpMutation.isPending ? "Memproses..." : "Konfirmasi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  )
}
