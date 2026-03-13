"use client"

import { Card, CardContent } from "../ui/card"
import { cn } from "../../lib/utils"
import type { Icon } from "@phosphor-icons/react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: Icon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({ title, value, description, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("py-0", className)} aria-label={`${title}: ${value}`}>
      <CardContent className="flex items-center gap-4 p-5">
        {Icon && (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
            <Icon className="size-5 text-foreground/70" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="truncate text-2xl font-bold tracking-tight">{value}</p>
            {trend && (
              <span
                className={cn(
                  "shrink-0 text-xs font-medium",
                  trend.isPositive ? "text-emerald-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
