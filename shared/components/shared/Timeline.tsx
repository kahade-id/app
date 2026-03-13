"use client"

import { cn } from "../../lib/utils"

interface TimelineProps {
  children: React.ReactNode
  className?: string
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div className={cn("relative space-y-0", className)}>
      {children}
    </div>
  )
}
