"use client"

import { useState } from "react"
import { Gift, Users, Wallet, ArrowsClockwise, PaperPlaneTilt, WhatsappLogo, Link as LinkIcon } from "@phosphor-icons/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingState, ErrorState, PageHeader, StatsCard, CopyButton, DataTable, PageTransition, ConfirmDialog } from "@/components/shared"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { DataTableColumn } from "@/components/shared"
import { toast } from "sonner"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { useMyReferral, useReferralHistory, useReferralStats, useReferralRewards, useApplyReferral, useRegenerateReferralCode } from "@/lib/hooks/use-referral"
import { formatIDR } from "@/lib/currency"
import { formatRelative } from "@/lib/date"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import type { ReferralReward } from "@/types/referral"

export default function ReferralPage() {
  usePageTitle("Referral")
  const { data: referral, isLoading, isError, refetch } = useMyReferral()
  // L-12 FIX: useReferralStats and useReferralRewards were imported and available
  // but never called — hooks and service existed, but UI showed nothing from them.
  const { data: referralStats } = useReferralStats()
  const { data: referralRewardsData } = useReferralRewards({ limit: DEFAULT_PAGE_SIZE })
  const { data: history, isLoading: historyLoading } = useReferralHistory({ limit: DEFAULT_PAGE_SIZE })
  const applyReferral = useApplyReferral()
  const regenerateCode = useRegenerateReferralCode()

  const [applyCode, setApplyCode] = useState("")
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false)

  if (isLoading) return <LoadingState fullPage text="Memuat referral..." />
  if (isError) return <ErrorState title="Gagal Memuat Referral" onRetry={() => refetch()} />

  const handleApply = () => {
    if (!applyCode.trim()) return
    applyReferral.mutate({ code: applyCode.trim() }, {
      onSuccess: () => setApplyCode(""),
    })
  }

  const handleRegenerate = () => {
    regenerateCode.mutate(undefined, {
      onSuccess: () => setShowRegenerateConfirm(false),
    })
  }

  const columns: DataTableColumn<ReferralReward>[] = [
    { key: "rewardAmount", header: "Hadiah", cell: (row) => formatIDR(row.rewardAmount ?? 0) },
    { key: "feeAmount", header: "Dari Biaya", cell: (row) => formatIDR(row.feeAmount ?? 0) },
    { key: "status", header: "Status", cell: (row) => row.isCredited ? "Dikreditkan" : "Menunggu" },
    { key: "createdAt", header: "Waktu", cell: (row) => formatRelative(row.createdAt) },
  ]

  return (
    <PageTransition className="space-y-6">
      <PageHeader title="Program Referral" description="Undang teman dan dapatkan hadiah" />

      {referral && (
        <>
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Kode Referral Anda</p>
                  <p className="mt-1 text-sm text-muted-foreground">Bagikan kode ini kepada teman Anda</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-xl border border-dashed border-border bg-muted/50 px-5 py-3">
                    <code className="font-mono text-2xl font-bold tracking-[0.2em]">
                      {referral.code}
                    </code>
                  </div>
                  <CopyButton value={referral.code} />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Salin link referral"
                        data-testid="button-copy-referral-link"
                        onClick={() => {
                          const url = `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${referral.code}`
                          navigator.clipboard.writeText(url).then(() => toast.success("Link referral disalin!")).catch(() => toast.error("Gagal menyalin link"))
                        }}
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Salin Link</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Bagikan via WhatsApp"
                        data-testid="button-share-whatsapp"
                        onClick={() => {
                          const url = `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${referral.code}`
                          const text = `Yuk daftar di Kahade! Gunakan kode referral saya: ${referral.code}. Daftar di sini: ${url}`
                          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
                        }}
                      >
                        <WhatsappLogo className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Bagikan via WhatsApp</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowRegenerateConfirm(true)}
                        disabled={regenerateCode.isPending}
                        aria-label="Buat ulang kode"
                        data-testid="button-regenerate-referral-code"
                      >
                        <ArrowsClockwise className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Buat Ulang Kode</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatsCard title="Total Referral" value={referral.totalReferrals} icon={Users} />
            <StatsCard title="Total Hadiah" value={formatIDR(referral.totalRewardEarned)} icon={Wallet} />
            <StatsCard title="Hadiah Tertunda" value={referral.pendingRewardCount} icon={Gift} />
          </div>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PaperPlaneTilt className="h-5 w-5" />
            Terapkan Kode Referral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Masukkan kode referral"
              value={applyCode}
              onChange={(e) => setApplyCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              className="font-mono uppercase"
              data-testid="input-referral-apply-code"
            />
            <Button
              onClick={handleApply}
              disabled={!applyCode.trim() || applyReferral.isPending}
              data-testid="button-apply-referral"
            >
              {applyReferral.isPending ? "Menerapkan..." : "Terapkan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader>
          <CardTitle>Riwayat Hadiah</CardTitle>
        </CardHeader>
        <CardContent>
          {/* L-12 FIX: Use referralRewardsData from useReferralRewards (dedicated endpoint)
              instead of generic history — this data is specifically about reward transactions. */}
          <DataTable
            columns={columns}
            data={referralRewardsData?.data ?? history?.data ?? []}
            isLoading={historyLoading}
            emptyTitle="Belum Ada Riwayat"
            emptyDescription="Ajak teman untuk mulai mendapatkan hadiah referral."
            rowKey={(row) => row.id}
          />
        </CardContent>
      </Card>

      {/* L-12 FIX: Display referralStats if available — total transactions from referred users */}
      {referralStats && (
        <Card className="py-0">
          <CardHeader>
            <CardTitle>Statistik Referral</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Referral</p>
                <p className="mt-1 text-2xl font-bold">{referralStats.totalReferrals ?? 0}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Reward</p>
                <p className="mt-1 text-2xl font-bold">{formatIDR(referralStats.totalRewards ?? 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={showRegenerateConfirm}
        onOpenChange={setShowRegenerateConfirm}
        title="Buat Ulang Kode Referral?"
        description="Kode referral lama Anda tidak akan bisa digunakan lagi. Apakah Anda yakin ingin membuat kode baru?"
        confirmLabel="Buat Ulang"
        onConfirm={handleRegenerate}
        isLoading={regenerateCode.isPending}
        confirmTestId="button-confirm-regenerate-referral"
        cancelTestId="button-cancel-regenerate-referral"
        variant="destructive"
      />
    </PageTransition>
  )
}
