"use client"

import { ArrowsDownUp, ArrowUp, ArrowDown } from "@phosphor-icons/react"
import { Button } from "../ui/button"

type SortDir = "asc" | "desc" | null

interface SortButtonProps {
  label: string
  active: boolean
  direction: SortDir
  onClick: () => void
}

export function SortButton({ label, active, direction, onClick }: SortButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={onClick}
      aria-sort={active ? (direction === "asc" ? "ascending" : direction === "desc" ? "descending" : undefined) : undefined}
    >
      {label}
      {active && direction === "asc" ? (
        <ArrowUp className="ml-1 size-4" />
      ) : active && direction === "desc" ? (
        <ArrowDown className="ml-1 size-4" />
      ) : (
        <ArrowsDownUp className="ml-1 size-4" />
      )}
    </Button>
  )
}
