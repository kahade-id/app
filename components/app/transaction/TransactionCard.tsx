"use client"

import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TransactionStatusBadge } from "./TransactionStatusBadge"
import { formatIDR } from "@/lib/currency"
import { formatRelative } from "@/lib/date"
import type { Order } from "@/types/transaction"

interface TransactionCardProps {
  order: Order
  onClick?: () => void
}

// #43 — Pure presentational component: memoize to prevent re-renders from parent
export const TransactionCard = memo(function TransactionCard({ order, onClick }: TransactionCardProps) {
  return (
    // #62 — Use article for self-contained order card (semantic HTML)
    <article aria-label={`Transaksi: ${order.title}`} data-testid={`card-transaction-${order.orderId}`}>
      <Card
        className={onClick ? "cursor-pointer hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1" : undefined}
        onClick={onClick}
        {...(onClick ? {
          role: "button",
          tabIndex: 0,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick() }
          },
        } : {})}
      >
        <CardContent className="flex items-center justify-between p-4">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{order.orderId}</span>
              <TransactionStatusBadge status={order.status} />
            </div>
            <p className="font-medium truncate">{order.title}</p>
            <time dateTime={order.createdAt} className="text-sm text-muted-foreground">
              {formatRelative(order.createdAt)}
            </time>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="font-semibold">{formatIDR(order.orderValue)}</p>
          </div>
        </CardContent>
      </Card>
    </article>
  )
})
