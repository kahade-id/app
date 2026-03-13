"use client"

import { cn } from "../../lib/utils"
import { SpinnerGap } from "@phosphor-icons/react"
import { Skeleton } from "../ui/skeleton"

type LoadingVariant = "spinner" | "skeleton"

interface LoadingStateProps {
  text?: string
  className?: string
  fullPage?: boolean
  /** #290 — skeleton variant shows content-shaped placeholder */
  variant?: LoadingVariant
  /** Number of skeleton rows (for variant="skeleton") */
  skeletonRows?: number
}

function SkeletonVariant({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3 w-full", className)} role="status" aria-label="Memuat...">
      {Array.from({ length: rows }, (_, i) => (
        <div key={`sk-${i}`} className="space-y-2">
          <Skeleton className={cn("h-4 rounded", i % 3 === 0 ? "w-3/4" : i % 3 === 1 ? "w-full" : "w-1/2")} />
        </div>
      ))}
      <span className="sr-only">Memuat konten...</span>
    </div>
  )
}

export function LoadingState({
  text = "Memuat...",
  className,
  fullPage,
  variant = "spinner",
  skeletonRows = 3,
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <SkeletonVariant
        rows={skeletonRows}
        className={cn(fullPage && "min-h-[60vh] items-center justify-center flex", className)}
      />
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={text}
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16",
        fullPage && "min-h-[60vh]",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-muted/50">
        <SpinnerGap className="size-5 animate-spin text-foreground/60" aria-hidden="true" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
