"use client"

import { forwardRef } from "react"
import { ArrowCounterClockwise } from "@phosphor-icons/react"

/**
 * Indikator visual untuk pull-to-refresh.
 *
 * Posisi awal: tersembunyi di atas (transform: translateY(-56px)).
 * usePullToRefresh hook mengontrol transform & opacity-nya secara langsung
 * (tanpa React state) supaya animasi frame-rate sempurna tanpa re-render.
 *
 * Attribute `data-refreshing` di-set oleh hook saat spinner aktif.
 * CSS `[&[data-refreshing]_svg]:animate-spin` baru aktif saat itu.
 */
export const PullToRefreshIndicator = forwardRef<HTMLDivElement>(function PullToRefreshIndicator(
  _,
  ref
) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="
        pointer-events-none absolute left-1/2 top-0 z-50
        -translate-x-1/2 -translate-y-14
        flex size-11 items-center justify-center
        rounded-full border border-border bg-white shadow-md
        opacity-0
        transition-[transform,opacity] duration-300 ease-out
        will-change-[transform,opacity]
        [&[data-refreshing]_svg]:animate-spin
      "
    >
      <ArrowCounterClockwise
        className="size-[18px] text-muted-foreground transition-none"
        weight="bold"
        aria-hidden="true"
      />
    </div>
  )
})
