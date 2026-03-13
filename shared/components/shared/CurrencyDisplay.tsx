"use client"

import { formatIDR } from "../../lib/currency"
import { cn } from "../../lib/utils"

interface CurrencyDisplayProps {
  amount: number
  compact?: boolean
  withRp?: boolean
  className?: string
  colorize?: boolean
}

export function CurrencyDisplay({
  amount,
  compact,
  withRp = true,
  className,
  colorize,
}: CurrencyDisplayProps) {
  return (
    <span
      className={cn(
        "tabular-nums",
        colorize && amount > 0 && "text-emerald-600",
        colorize && amount < 0 && "text-red-600",
        className
      )}
    >
      {amount < 0 ? "-" : ""}{formatIDR(Math.abs(amount), { compact, withRp })}
    </span>
  )
}
