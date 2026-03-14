"use client"

import { useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, CheckCircle, Warning, Wallet, Plus, ArrowCircleUp, ArrowCircleDown, Scales, ArrowClockwise } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatsCard, LoadingState, ErrorState, DataTable, PageHeader, PageTransition, StaggerContainer, StaggerItem } from "@/components/shared"
import type { DataTableColumn } from "@/components/shared"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { useUserStats } from "@/lib/hooks/use-user"
import { useWallet } from "@/lib/hooks/use-wallet"
import { useTransactions, useRecentTransactions } from "@/lib/hooks/use-transactions"
import { cn } from "@/lib/utils"
import { formatIDR } from "@/lib/currency"
import { formatRelative } from "@/lib/date"
import { ROUTES, ORDER_STATUS_LABELS } from "@/lib/constants"
import { StatusBadge } from "@/components/shared"
import type { Order } from "@/types/transaction"

// #53/#274 — All top-level queries run in parallel (each has its own useQuery)
// React Query automatically parallelises sibling hooks

// Stable skeleton IDs avoid index-as-key warning (#38)
const STATS_SKELETONS = ["s1", "s2", "s3", "s4"] as const
const ACTION_SKELETONS = ["a1", "a2", "a3", "a4"] as const

export default function DashboardPage() {
  usePageTitle("Dashboard")
  const router = useRouter()

  // #53 — All 3 queries fire simultaneously (no sequential waterfall)
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useUserStats()
  const { data: wallet, isLoading: walletLoading, isError: walletError, refetch: refetchWallet } = useWallet()
  // #17 FIX: Gunakan useRecentTransactions (wrapper semantic) bukan useTransactions({ limit: 5 })
  const { data: txData, isLoading: txLoading, isError: txError, refetch: refetchTx } = useRecentTransactions(5)

  // H-10 FIX: Previously txLoading was excluded from isInitialLoading, so the
  // "Transaksi Terbaru" table briefly showed "Belum Ada Transaksi" while tx data
  // was still loading. Including txLoading ensures the skeleton persists until ALL
  // data is ready, preventing the misleading empty state flash.
  const isInitialLoading = statsLoading || walletLoading || txLoading

  // #31/#172 — Stable callbacks
  const handleRefresh = useCallback(() => {
    refetchStats()
    refetchWallet()
    refetchTx()
  }, [refetchStats, refetchWallet, refetchTx])

  const handleRowClick = useCallback(
    (row: Order) => router.push(ROUTES.TRANSACTION_DETAIL(row.id)),
    [router]
  )

  // H-07: useMemo prevents new array reference on every render, avoiding DataTable re-renders
  const columns = useMemo<DataTableColumn<Order>[]>(() => [
    { key: "orderId", header: "ID Order", cell: (row) => <span className="font-mono text-xs">{row.orderId}</span> },
    { key: "title", header: "Judul", cell: (row) => <span className="font-medium">{row.title}</span> },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} label={ORDER_STATUS_LABELS[row.status]} /> },
    { key: "orderValue", header: "Nilai", cell: (row) => formatIDR(row.orderValue ?? 0) },
    { key: "createdAt", header: "Waktu", cell: (row) => formatRelative(row.createdAt) },
  ], [])

  if (statsError || walletError) {
    return (
      <PageTransition className="space-y-6">
        <ErrorState title="Gagal Memuat Dashboard" onRetry={handleRefresh} />
      </PageTransition>
    )
  }

  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Ringkasan aktivitas akun Anda"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={statsLoading || walletLoading || txLoading}
            aria-label="Muat ulang data dashboard"
            data-testid="button-dashboard-refresh"
          >
            <ArrowClockwise
              className={cn("size-4", (statsLoading || walletLoading || txLoading) && "animate-spin")}
              aria-hidden="true"
            />
            Refresh
          </Button>
        }
      />

      {isInitialLoading ? (
        <div className="space-y-6" aria-busy="true" aria-label="Memuat dashboard...">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STATS_SKELETONS.map((k) => (
              <Skeleton key={k} className="h-[76px] rounded-xl" />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ACTION_SKELETONS.map((k) => (
              <Skeleton key={k} className="h-[72px] rounded-xl" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-64 rounded-xl lg:col-span-2" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      ) : (
        <>
          <StaggerContainer className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatsCard title="Total Transaksi" value={stats?.totalOrders ?? 0} icon={ShoppingCart} />
            </StaggerItem>
            <StaggerItem>
              <StatsCard title="Transaksi Selesai" value={stats?.completedOrders ?? 0} icon={CheckCircle} />
            </StaggerItem>
            <StaggerItem>
              <StatsCard title="Dispute Aktif" value={stats?.activeDisputes ?? 0} icon={Warning} />
            </StaggerItem>
            <StaggerItem>
              <StatsCard title="Saldo Wallet" value={formatIDR(wallet?.availableBalance ?? 0)} icon={Wallet} />
            </StaggerItem>
          </StaggerContainer>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Button className="h-auto flex-col gap-2 py-4" onClick={() => router.push(ROUTES.TRANSACTION_NEW)} data-testid="button-quick-create-transaction">
                  <Plus className="size-5" aria-hidden="true" />
                  <span>Buat Transaksi</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => router.push(ROUTES.WALLET_TOPUP)} data-testid="button-quick-topup">
                  <ArrowCircleUp className="size-5" aria-hidden="true" />
                  <span>Top Up</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => router.push(ROUTES.WALLET_WITHDRAW)} data-testid="button-quick-withdraw">
                  <ArrowCircleDown className="size-5" aria-hidden="true" />
                  <span>Tarik Dana</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => router.push(ROUTES.DISPUTES)} data-testid="button-quick-disputes">
                  <Scales className="size-5" aria-hidden="true" />
                  <span>Dispute</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {txError ? (
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-base">Transaksi Terbaru</CardTitle></CardHeader>
                <CardContent><ErrorState onRetry={() => refetchTx()} /></CardContent>
              </Card>
            ) : (
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.TRANSACTIONS)} data-testid="button-see-all-transactions">Lihat Semua</Button>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={txData?.data ?? []}
                    isLoading={txLoading}
                    emptyTitle="Belum Ada Transaksi"
                    emptyDescription="Anda belum memiliki transaksi."
                    onRowClick={handleRowClick}
                    rowKey={(row) => row.id}
                    testId="dashboard-transactions"
                    caption="5 transaksi terbaru"
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ringkasan Wallet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {walletLoading ? (
                  <LoadingState text="Memuat wallet..." />
                ) : wallet ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Saldo Tersedia</span>
                        <span className="font-semibold">{formatIDR(wallet.availableBalance)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Dana Escrow</span>
                        <span className="font-semibold">{formatIDR(wallet.escrowBalance)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-3 text-sm">
                        <span className="text-muted-foreground">Total Saldo</span>
                        <span className="text-base font-bold">{formatIDR(wallet.totalBalance)}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => router.push(ROUTES.WALLET)} data-testid="button-goto-wallet-detail">
                      Lihat Detail Wallet
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Data wallet tidak tersedia.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </PageTransition>
  )
}
