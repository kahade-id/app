"use client"

import { StatusBadge } from "@/components/shared"
import { ORDER_STATUS_LABELS } from "@/lib/constants"
import type { OrderStatus } from "@/types/transaction"

interface TransactionStatusBadgeProps {
  status: OrderStatus | string
  className?: string
  pulse?: boolean
}

export function TransactionStatusBadge({ status, className, pulse }: TransactionStatusBadgeProps) {
  return (
    <StatusBadge
      status={status}
      label={ORDER_STATUS_LABELS[status]}
      className={className}
      pulse={pulse}
    />
  )
}
