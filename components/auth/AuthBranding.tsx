"use client"

import { Shield } from "@phosphor-icons/react"

export function AuthBranding() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <Shield className="size-8" weight="fill" />
      <span className="text-2xl font-bold tracking-tight">Kahade</span>
    </div>
  )
}
