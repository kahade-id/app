"use client"

import {
  Avatar as AvatarRoot,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar"
import { cn } from "../../lib/utils"

interface AvatarProps {
  src?: string | null
  name: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const SIZE_MAP: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "size-8",
  md: "size-10",
  lg: "size-14",
  xl: "size-20",
}

// #46 — Map size tokens to explicit pixel dimensions for AvatarImage
const PIXEL_SIZE_MAP: Record<NonNullable<AvatarProps["size"]>, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
}

const TEXT_SIZE_MAP: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-xl",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function UserAvatar({ src, name, className, size = "md" }: AvatarProps) {
  const px = PIXEL_SIZE_MAP[size]

  return (
    <AvatarRoot className={cn(SIZE_MAP[size], "ring-2 ring-background", className)}>
      {src && (
        // #46 — Explicit width/height prevents layout shift (CLS)
        // #61 — alt text is the user's name for screen readers
        <AvatarImage
          src={src}
          alt={`Foto profil ${name}`}
          width={px}
          height={px}
        />
      )}
      <AvatarFallback
        className={cn("font-medium", TEXT_SIZE_MAP[size])}
        aria-label={`Inisial ${name}`}
      >
        {getInitials(name)}
      </AvatarFallback>
    </AvatarRoot>
  )
}
