"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LoadingState, ErrorState, PageHeader, StatusBadge, PageTransition } from "@/components/shared"
import { DisputeEvidenceList, DisputeSubmitEvidence } from "@/components/app/dispute/DisputeMessages"
import { DisputeTimeline } from "@/components/app/dispute/DisputeTimeline"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { useDisputeDetail, useSubmitEvidence } from "@/lib/hooks/use-dispute"
import { formatIDR } from "@/lib/currency"
import { formatDateTime, formatRelative } from "@/lib/date"
import { ROUTES, DISPUTE_STATUS_LABELS } from "@/lib/constants"

export default function DisputeDetailPage() {
  usePageTitle("Detail Dispute")
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: dispute, isLoading, isError, refetch } = useDisputeDetail(id)
  const submitEvidence = useSubmitEvidence()

  const handleSubmitEvidence = (data: { description: string; fileUrls: string[]; fileTypes: string[] }) => {
    submitEvidence.mutate({ id, data })
  }

  if (isLoading) return <LoadingState fullPage text="Memuat detail dispute..." />
  if (isError || !dispute) return <ErrorState title="Gagal Memuat Detail Dispute" onRetry={() => refetch()} />

  return (
    <PageTransition className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex items-center gap-1.5">
          <li><Link href={ROUTES.DISPUTES} className="hover:text-foreground transition-colors">Dispute</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground font-medium">{dispute.disputeId}</li>
        </ol>
      </nav>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Kembali" className="shrink-0 rounded-xl border border-border bg-muted hover:bg-muted/80" onClick={() => router.push(ROUTES.DISPUTES)} data-testid="button-dispute-detail-back">
          <ArrowLeft className="size-4" />
        </Button>
        <PageHeader
          title={`Dispute ${dispute.disputeId}`}
          action={<StatusBadge status={dispute.status} label={DISPUTE_STATUS_LABELS[dispute.status]} />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Detail Dispute</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><p className="text-xs text-muted-foreground">Order ID</p><p className="text-sm font-mono">{dispute.orderId}</p></div>
                <div><p className="text-xs text-muted-foreground">Diajukan Oleh</p><p className="text-sm">{dispute.initiatedBy === "BUYER" ? "Pembeli" : dispute.initiatedBy === "SELLER" ? "Penjual" : "Keduanya"}</p></div>
                <div><p className="text-xs text-muted-foreground">Dibuat</p><p className="text-sm">{formatDateTime(dispute.createdAt)}</p></div>
                {dispute.slaDeadlineAt && (
                  <div><p className="text-xs text-muted-foreground">Batas SLA</p><p className="text-sm">{formatDateTime(dispute.slaDeadlineAt)}</p></div>
                )}
              </div>
              {dispute.buyerClaim && (
                <>
                  <Separator />
                  <div><p className="text-xs text-muted-foreground">Klaim Pembeli</p><p className="text-sm">{dispute.buyerClaim}</p></div>
                </>
              )}
              {dispute.sellerClaim && (
                <>
                  <Separator />
                  <div><p className="text-xs text-muted-foreground">Klaim Penjual</p><p className="text-sm">{dispute.sellerClaim}</p></div>
                </>
              )}
            </CardContent>
          </Card>

          <DisputeEvidenceList evidences={dispute.evidences} />

          {dispute.decision && (
            <Card>
              <CardHeader><CardTitle>Keputusan</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><p className="text-xs text-muted-foreground">Tipe Keputusan</p><p className="text-sm font-medium">{dispute.decision.decisionType === "FULL_BUYER" ? "Seluruhnya untuk Pembeli" : dispute.decision.decisionType === "FULL_SELLER" ? "Seluruhnya untuk Penjual" : "Dibagi"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Jumlah Pembeli</p><p className="text-sm">{formatIDR(dispute.decision.buyerAmount)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Jumlah Penjual</p><p className="text-sm">{formatIDR(dispute.decision.sellerAmount)}</p></div>
                </div>
                {dispute.decision.decisionNotes && (
                  <div><p className="text-xs text-muted-foreground">Catatan</p><p className="text-sm">{dispute.decision.decisionNotes}</p></div>
                )}
              </CardContent>
            </Card>
          )}

          {['OPEN', 'WAITING_RESPONSE'].includes(dispute.status) && (
            <DisputeSubmitEvidence isPending={submitEvidence.isPending} onSubmit={handleSubmitEvidence} />
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={dispute.status} label={DISPUTE_STATUS_LABELS[dispute.status]} />
              </div>
              {dispute.isSlaBreached && (
                <p className="text-xs text-destructive font-medium">SLA telah terlewati</p>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dibuat</span>
                <span>{formatRelative(dispute.createdAt)}</span>
              </div>
              {dispute.resolvedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Diselesaikan</span>
                  <span>{formatDateTime(dispute.resolvedAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent>
              <DisputeTimeline dispute={dispute} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Aksi</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => router.push(ROUTES.CHAT(dispute.orderId))} data-testid="button-dispute-open-chat">
                Buka Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
