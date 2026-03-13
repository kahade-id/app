"use client"

import { Timeline, TimelineItem } from "@/components/shared"
import { formatDateTime } from "@/lib/date"
import { DISPUTE_STATUS_LABELS } from "@/lib/constants"
import type { Dispute } from "@/types/dispute"

interface DisputeTimelineProps {
  dispute: Dispute
  className?: string
}

interface TimelineEntry {
  title: string
  description?: string
  timestamp: string
  variant: "default" | "success" | "warning" | "danger" | "info"
}

export function DisputeTimeline({ dispute, className }: DisputeTimelineProps) {
  const entries: TimelineEntry[] = []

  entries.push({
    title: "Dispute Dibuat",
    description: `Diajukan oleh ${dispute.initiatedBy === "BUYER" ? "Pembeli" : dispute.initiatedBy === "SELLER" ? "Penjual" : "Keduanya"}`,
    timestamp: formatDateTime(dispute.createdAt),
    variant: "info",
  })

  if (dispute.buyerClaimedAt) {
    entries.push({
      title: "Klaim Pembeli Diajukan",
      description: dispute.buyerClaim ?? undefined,
      timestamp: formatDateTime(dispute.buyerClaimedAt),
      variant: "default",
    })
  }

  if (dispute.sellerClaimedAt) {
    entries.push({
      title: "Klaim Penjual Diajukan",
      description: dispute.sellerClaim ?? undefined,
      timestamp: formatDateTime(dispute.sellerClaimedAt),
      variant: "default",
    })
  }

  if (dispute.assignedAt) {
    entries.push({
      title: DISPUTE_STATUS_LABELS["ASSIGNED"] ?? "Ditugaskan",
      description: "Admin telah ditugaskan untuk menangani dispute",
      timestamp: formatDateTime(dispute.assignedAt),
      variant: "warning",
    })
  }

  if (dispute.status === "ESCALATED" || dispute.escalatedAt) {
    entries.push({
      title: DISPUTE_STATUS_LABELS["ESCALATED"] ?? "Dieskalasi",
      description: "Dispute telah dieskalasi ke tingkat yang lebih tinggi",
      timestamp: formatDateTime(dispute.escalatedAt ?? dispute.updatedAt ?? dispute.createdAt),
      variant: "danger",
    })
  }

  if (dispute.resolvedAt) {
    entries.push({
      title: DISPUTE_STATUS_LABELS["RESOLVED"] ?? "Selesai",
      description: dispute.decision?.decisionNotes ?? "Dispute telah diselesaikan",
      timestamp: formatDateTime(dispute.resolvedAt),
      variant: "success",
    })
  }

  return (
    <Timeline className={className}>
      {entries.map((entry, index) => (
        <TimelineItem
          key={`${entry.title}-${entry.timestamp}`}
          title={entry.title}
          description={entry.description}
          timestamp={entry.timestamp}
          variant={entry.variant}
          isLast={index === entries.length - 1}
        />
      ))}
    </Timeline>
  )
}
