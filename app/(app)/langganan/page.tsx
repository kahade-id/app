"use client"

import * as React from "react"
import { CheckCircle, Crown } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingState, ErrorState, PageHeader, ConfirmDialog, PageTransition } from "@/components/shared"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { useSubscriptionStatus, useSubscribe, useCancelSubscription, useToggleAutoRenew, useSubscriptionPlans } from "@/lib/hooks/use-subscription"
import { formatIDR } from "@/lib/currency"
import { formatDate } from "@/lib/date"
import type { SubscriptionPlan } from "@/types/subscription"
import type { SubscriptionPlanDetail } from "@/lib/services/subscription.service"

export default function LanggananPage() {
  usePageTitle("Langganan")
  const { data: status, isLoading: statusLoading, isError: statusError, refetch } = useSubscriptionStatus()
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans()
  const subscribe = useSubscribe()
  const cancelSub = useCancelSubscription()
  const toggleAutoRenew = useToggleAutoRenew()

  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false)

  if (statusLoading || plansLoading) return <LoadingState fullPage text="Memuat langganan..." />
  if (statusError) return <ErrorState title="Gagal Memuat Langganan" onRetry={() => refetch()} />

  const isActive = status?.status === "ACTIVE"

  return (
    <PageTransition className="space-y-6">
      <PageHeader title="Langganan Kahade+" description="Nikmati fitur premium dengan biaya lebih rendah" />

      {isActive && status && (
        <Card className="border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Crown className="size-5 text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Kahade+ Aktif</h3>
                  <p className="text-sm text-muted-foreground">Paket {status.plan === "MONTHLY" ? "Bulanan" : "Tahunan"}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Periode</p>
                    <p className="mt-1 text-sm font-medium">{formatDate(status.currentPeriodStart)} - {formatDate(status.currentPeriodEnd)}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Perpanjangan Otomatis</p>
                    <p className="mt-1 text-sm font-medium">{status.isAutoRenew ? "Aktif" : "Nonaktif"}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Penghematan Digunakan</p>
                    <p className="mt-1 text-sm font-medium">{formatIDR(status.feeSavingsUsed)} / {formatIDR(status.feeSavingsLimit)}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sisa Penghematan</p>
                    <p className="mt-1 text-sm font-semibold">{formatIDR(status.feeSavingsRemaining)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={() => toggleAutoRenew.mutate()} disabled={toggleAutoRenew.isPending} data-testid="button-toggle-auto-renew">
                    {status.isAutoRenew ? "Matikan Perpanjangan" : "Aktifkan Perpanjangan"}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setCancelDialogOpen(true)} disabled={cancelSub.isPending} data-testid="button-cancel-subscription">
                    Batalkan Langganan
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* L-16 NOTE: Feature comparison table is hardcoded in this component.
          If subscription features change, this table MUST be updated manually in code.
          To fix: when the backend provides a feature comparison endpoint, replace with
          useSubscriptionBenefits() data from use-subscription.ts (hook already exists).
          Until then, keep this table in sync with the actual plan differences. */}
      <Card className="py-0">
        <CardHeader>
          <CardTitle className="text-lg">Perbandingan Fitur</CardTitle>
          <CardDescription>Bandingkan fitur antara paket Gratis dan Kahade+</CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Fitur</th>
                  <th className="py-3 px-4 text-center font-medium text-muted-foreground">Gratis</th>
                  <th className="py-3 px-4 text-center font-medium text-muted-foreground">Bulanan</th>
                  <th className="py-3 pl-4 text-center font-medium text-muted-foreground">Tahunan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { feature: "Biaya Platform", free: "1.5%", monthly: "1%", annual: "0.8%" },
                  { feature: "Limit Transaksi", free: "Rp 10 juta", monthly: "Rp 50 juta", annual: "Rp 100 juta" },
                  { feature: "Badge Kahade+", free: "—", monthly: "✓", annual: "✓" },
                  { feature: "Prioritas Support", free: "—", monthly: "✓", annual: "✓" },
                  { feature: "Akses Fitur Beta", free: "—", monthly: "—", annual: "✓" },
                  { feature: "Limit Penghematan", free: "—", monthly: "Standar", annual: "Lebih Tinggi" },
                ].map((row) => (
                  <tr key={row.feature}>
                    <td className="py-3 pr-4 font-medium">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">{row.free}</td>
                    <td className="py-3 px-4 text-center">{row.monthly}</td>
                    <td className="py-3 pl-4 text-center">{row.annual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        {(plans ?? []).length > 0 ? (plans as SubscriptionPlanDetail[]).map((planDetail) => {
          const isAnnual = planDetail.duration >= 365
          const plan: SubscriptionPlan = isAnnual ? "ANNUAL" : "MONTHLY"
          const periodLabel = isAnnual ? "/tahun" : "/bulan"
          const fallbackFeatures = isAnnual
            ? ["Semua fitur Bulanan", "Biaya platform lebih rendah", "Akses fitur beta", "Limit penghematan lebih tinggi"]
            : ["Biaya platform lebih rendah", "Badge Kahade+", "Prioritas customer support", "Limit transaksi lebih tinggi"]
          const features = planDetail.features?.length ? planDetail.features : fallbackFeatures
          return (
            <Card key={planDetail.id} className={`relative ${isAnnual ? "overflow-visible border-primary/30" : ""} py-0`}>
              {isAnnual && (
                <div className="absolute -top-3 right-4 z-10">
                  <Badge className="bg-primary px-3 py-1 shadow-sm">Hemat 20%</Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{planDetail.name ?? (isAnnual ? "Tahunan" : "Bulanan")}</CardTitle>
                <CardDescription>{isAnnual ? "Hemat lebih banyak dengan paket tahunan" : "Fleksibel tanpa komitmen panjang"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pb-6">
                <div className="border-b border-border pb-4">
                  <span className="text-3xl font-bold tracking-tight">{formatIDR(planDetail.price ?? 0)}</span>
                  <span className="text-sm text-muted-foreground"> {periodLabel}</span>
                </div>
                <ul className="space-y-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <CheckCircle className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" disabled={isActive || subscribe.isPending} onClick={() => subscribe.mutate({ plan })} data-testid={`button-subscribe-${plan}`}>
                  {subscribe.isPending ? "Memproses..." : isActive ? "Sudah Aktif" : "Mulai Berlangganan"}
                </Button>
              </CardContent>
            </Card>
          )
        }) : (
          <>
            <Card className="relative py-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Bulanan</CardTitle>
                <CardDescription>Fleksibel tanpa komitmen panjang</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pb-6">
                <div className="border-b border-border pb-4">
                  <span className="text-3xl font-bold tracking-tight">{formatIDR(49900)}</span>
                  <span className="text-sm text-muted-foreground"> /bulan</span>
                </div>
                <ul className="space-y-3">
                  {["Biaya platform lebih rendah (1%)", "Badge Kahade+", "Prioritas customer support", "Limit transaksi lebih tinggi"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <CheckCircle className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" disabled={isActive || subscribe.isPending} onClick={() => subscribe.mutate({ plan: "MONTHLY" as SubscriptionPlan })} data-testid="button-subscribe-monthly">
                  {subscribe.isPending ? "Memproses..." : isActive ? "Sudah Aktif" : "Mulai Berlangganan"}
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-visible border-primary/30 py-0">
              <div className="absolute -top-3 right-4 z-10">
                <Badge className="bg-primary px-3 py-1 shadow-sm">Hemat 20%</Badge>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Tahunan</CardTitle>
                <CardDescription>Hemat lebih banyak dengan paket tahunan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pb-6">
                <div className="border-b border-border pb-4">
                  <span className="text-3xl font-bold tracking-tight">{formatIDR(479000)}</span>
                  <span className="text-sm text-muted-foreground"> /tahun</span>
                </div>
                <ul className="space-y-3">
                  {["Semua fitur Bulanan", "Biaya platform lebih rendah (0.8%)", "Akses fitur beta", "Limit penghematan lebih tinggi"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <CheckCircle className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" disabled={isActive || subscribe.isPending} onClick={() => subscribe.mutate({ plan: "ANNUAL" as SubscriptionPlan })} data-testid="button-subscribe-annual">
                  {subscribe.isPending ? "Memproses..." : isActive ? "Sudah Aktif" : "Mulai Berlangganan"}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Batalkan Langganan?"
        description="Apakah Anda yakin ingin membatalkan langganan Kahade+? Fitur premium akan tetap aktif hingga akhir periode saat ini."
        confirmLabel="Batalkan Langganan"
        variant="destructive"
        isLoading={cancelSub.isPending}
        onConfirm={() => {
          cancelSub.mutate(undefined, { onSettled: () => setCancelDialogOpen(false) })
        }}
        confirmTestId="button-confirm-cancel-subscription"
        cancelTestId="button-cancel-cancel-subscription"
      />
    </PageTransition>
  )
}
