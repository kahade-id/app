"use client"

import { cn } from "../../lib/utils"

interface TimelineItemProps {
  title: string
  description?: string
  timestamp?: string
  icon?: React.ReactNode
  isLast?: boolean
  variant?: "default" | "success" | "warning" | "danger" | "info"
  className?: string
}

const VARIANT_DOT: Record<string, string> = {
  default: "bg-muted-foreground",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
}

export function TimelineItem({
  title,
  description,
  timestamp,
  icon,
  isLast = false,
  variant = "default",
  className,
}: TimelineItemProps) {
  return (
    <div className={cn("relative flex gap-4 pb-6", isLast && "pb-0", className)}>
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
      )}
      <div className="relative flex size-6 shrink-0 items-center justify-center">
        {icon ?? (
          <div className={cn("size-3 rounded-full", VARIANT_DOT[variant])} />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium leading-none">{title}</p>
          {timestamp && (
            <span className="shrink-0 text-xs text-muted-foreground">{timestamp}</span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}
