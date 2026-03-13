"use client"

import * as React from "react"
import { MagnifyingGlass, X } from "@phosphor-icons/react"
import { Input } from "../ui/input"
import { cn } from "../../lib/utils"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
  "data-testid"?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Cari...",
  className,
  debounceMs = 300,
  "data-testid": dataTestId,
}: SearchInputProps) {
  const [local, setLocal] = React.useState(value)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    setLocal(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setLocal(val)
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(val), debounceMs)
  }

  const handleClear = () => {
    setLocal("")
    onChange("")
  }

  return (
    <div className={cn("relative", className)}>
      <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={local}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9 pr-8"
        data-testid={dataTestId}
      />
      {local && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Hapus pencarian"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
