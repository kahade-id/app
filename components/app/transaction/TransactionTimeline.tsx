"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timeline, TimelineItem } from "@/components/shared"
import { ORDER_STATUS_LABELS } from "@/lib/constants"
import { formatDateTime } from "@/lib/date"
import type { OrderStatusHistory } from "@/types/transaction"

const statusVariantMap: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  WAITING_CONFIRMATION: "warning",
  WAITING_PAYMENT: "warning",
  PROCESSING: "info",
  IN_DELIVERY: "info",
  COMPLETED: "success",
  DISPUTED: "danger",
  CANCELLED: "danger",
}

interface TransactionTimelineProps {
  // NOTE-L06 FIX: Typed as potentially undefined to match runtime usage —
  // optional chaining (histories?.map) was used, indicating API may return null.
  histories: OrderStatusHistory[] | null | undefined
}

export function TransactionTimeline({ histories }: TransactionTimelineProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Riwayat Status</CardTitle></CardHeader>
      <CardContent>
        <Timeline>
          {histories?.map((h, i) => (
            <TimelineItem
              key={h.id}
              title={ORDER_STATUS_LABELS[h.toStatus] || h.toStatus}
              description={h.reason || undefined}
              timestamp={formatDateTime(h.createdAt)}
              variant={statusVariantMap[h.toStatus] || "default"}
              isLast={i === histories.length - 1}
            />
          ))}
        </Timeline>
      </CardContent>
    </Card>
  )
}
