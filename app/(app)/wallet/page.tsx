"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowCircleUp, ArrowCircleDown, ClockCounterClockwise, LockKey } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingState, ErrorState, PageHeader, DataTable, PageTransition } from "@/components/shared"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { useWallet, useWalletHistory } from "@/lib/hooks/use-wallet"
import { ROUTES } from "@/lib/constants"
import { WalletBalanceCard } from "@/components/app/wallet/WalletBalanceCard"
import { DailyLimitBar } from "@/components/app/wallet/DailyLimitBar"
import { getWalletSummaryColumns } from "@/components/app/wallet/WalletTransactionRow"
import { SetPinForm, ChangePinForm } from "@/components/app/wallet/PinInput"
import { LocalErrorBoundary } from "@/shared/components/shared/LocalErrorBoundary"

export default function WalletPage() {
  usePageTitle("Dompet")
  const router = useRouter()
  const [showChangePin, setShowChangePin] = useState(false)
  const { data: wallet, isLoading, isError, refetch } = useWallet()
  const { data: history, isLoading: historyLoading } = useWalletHistory({ limit: 5 })

  if (isError) return <ErrorState title="Gagal Memuat Wallet" onRetry={() => refetch()} />

  const columns = getWalletSummaryColumns()

  return (
    <LocalErrorBoundary fallbackTitle="Gagal Memuat Wallet" fallbackDescription="Halaman wallet mengalami kesalahan. Coba muat ulang.">
      <PageTransition className="space-y-6">
      <PageHeader title="Wallet" description="Kelola saldo dan transaksi wallet Anda" />

      {isLoading ? (
        <LoadingState text="Memuat wallet..." />
      ) : wallet ? (
        <>
          <WalletBalanceCard wallet={wallet} />

          <div className="grid gap-3 sm:grid-cols-3">
            <Button className="h-auto flex-col gap-2 py-4" onClick={() => router.push(ROUTES.WALLET_TOPUP)} data-testid="button-goto-topup">
              <ArrowCircleUp className="size-5" />
              <span>Top Up</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => router.push(ROUTES.WALLET_WITHDRAW)} data-testid="button-goto-withdraw">
              <ArrowCircleDown className="size-5" />
              <span>Tarik Dana</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => router.push(ROUTES.WALLET_HISTORY)} data-testid="button-goto-wallet-history">
              <ClockCounterClockwise className="size-5" />
              <span>Riwayat</span>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DailyLimitBar title="Limit Top Up Harian" usedAmount={wallet.todayTopupAmount} limitAmount={wallet.dailyTopupLimit} />
            <DailyLimitBar title="Limit Penarikan Harian" usedAmount={wallet.todayWithdrawAmount} limitAmount={wallet.dailyWithdrawLimit} />
          </div>

          {!wallet.hasPin && <SetPinForm />}

          {wallet.hasPin && (
            showChangePin ? (
              <ChangePinForm onCancel={() => setShowChangePin(false)} />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted border border-border">
                      <LockKey className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">PIN Wallet</p>
                      <p className="text-xs text-muted-foreground">PIN aktif dan terpasang</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowChangePin(true)} data-testid="button-change-pin">
                    Ganti PIN
                  </Button>
                </CardContent>
              </Card>
            )
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.WALLET_HISTORY)} data-testid="button-see-all-wallet-history">Lihat Semua</Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={history?.data ?? []}
                isLoading={historyLoading}
                emptyTitle="Belum Ada Transaksi"
                emptyDescription="Belum ada riwayat transaksi wallet."
                rowKey={(row) => row.id}
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </PageTransition>
    </LocalErrorBoundary>
  )
}
