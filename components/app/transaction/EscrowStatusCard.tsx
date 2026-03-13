"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatIDR } from "@/lib/currency"
import { formatDateTime, formatRelative } from "@/lib/date"
import type { Order } from "@/types/transaction"

interface EscrowStatusCardProps {
  order: Pick<Order, "buyerPayAmount" | "sellerReceiveAmount" | "deliveryDeadlineAt" | "createdAt">
}

export function EscrowStatusCard({ order }: EscrowStatusCardProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Status Escrow</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Pembeli Bayar</span>
          <span className="font-semibold">{formatIDR(order.buyerPayAmount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Penjual Terima</span>
          <span className="font-semibold">{formatIDR(order.sellerReceiveAmount)}</span>
        </div>
        {order.deliveryDeadlineAt && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Batas Pengiriman</span>
            <span>{formatDateTime(order.deliveryDeadlineAt)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Dibuat</span>
          <span>{formatRelative(order.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
