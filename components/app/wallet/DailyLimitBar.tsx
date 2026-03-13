"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatIDR } from "@/lib/currency"

interface DailyLimitBarProps {
  title: string
  usedAmount: number
  limitAmount: number
}

export function DailyLimitBar({ title, usedAmount, limitAmount }: DailyLimitBarProps) {
  const percent = Math.min(limitAmount > 0 ? (usedAmount / limitAmount) * 100 : 0, 100)

  // BUG-M05 FIX: Removed manual aria-valuenow/min/max props — Radix Progress
  // sets these internally from the `value` prop. Passing them manually caused
  // them to appear as HTML attributes on the wrapper div instead of the inner
  // role="progressbar" element. aria-label is kept (Radix spreads ...props to Root).

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-end gap-3">
        <Progress
          value={percent}
          className="h-2.5"
          aria-label={`${title}: ${formatIDR(usedAmount)} dari ${formatIDR(limitAmount)}`}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Terpakai: {formatIDR(usedAmount)}</span>
          <span>Limit: {formatIDR(limitAmount)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
