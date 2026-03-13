"use client"

import { cn } from "../../lib/utils"

interface PasswordStrengthProps {
  password: string
  className?: string
}

function getStrength(password: string): { score: number; label: string } {
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  const labels = ["Sangat Lemah", "Lemah", "Cukup", "Kuat", "Sangat Kuat"]
  return { score, label: labels[Math.max(0, score - 1)] ?? labels[0] }
}

const BAR_COLORS = [
  "bg-red-500",
  "bg-red-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-emerald-600",
]

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  if (!password) return null
  const { score, label } = getStrength(password)

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < score ? BAR_COLORS[score - 1] : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
