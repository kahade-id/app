"use client"

// ─── CharacterBackground ──────────────────────────────────────────────────────
// Komponen background animasi karakter keuangan + matematika.
// Dipakai di: splash screen (/), onboarding (/onboarding).
// Menggunakan CSS variable dari design system:
//   - hsl(var(--foreground)) → warna karakter mengikuti tema
//   - var(--font-sans)       → font yang sudah di-load via next/font

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

const BG_CHARS = "Rp%+−×÷=₿€$¥£∑∆αβγδφπσλμΩ0123456789ABCDEF"

interface CharacterBackgroundProps {
  /** Jumlah partikel. Default: 90 */
  count?: number
  /** Opacity maks partikel. Default: 0.13 */
  maxOpacity?: number
  className?: string
}

export function CharacterBackground({
  count = 90,
  maxOpacity = 0.13,
  className,
}: CharacterBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const particles = Array.from({ length: count }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      char:    BG_CHARS[Math.floor(Math.random() * BG_CHARS.length)],
      opacity: Math.random() * maxOpacity + 0.03,
      size:    Math.random() * 10 + 9,
      speed:   Math.random() * 0.28 + 0.07,
      drift:   (Math.random() - 0.5) * 0.09,
    }))

    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        ctx.globalAlpha = p.opacity
        ctx.fillStyle   = "hsl(var(--foreground))"
        ctx.font        = `300 ${p.size}px var(--font-sans, monospace)`
        ctx.fillText(p.char, p.x, p.y)

        p.y += p.speed
        p.x += p.drift

        if (p.y > canvas.height + 10) {
          p.y   = -10
          p.x   = Math.random() * canvas.width
          p.char = BG_CHARS[Math.floor(Math.random() * BG_CHARS.length)]
        }
        if (p.x < -10 || p.x > canvas.width + 10) {
          p.x = Math.random() * canvas.width
        }
      }
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [count, maxOpacity])

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 size-full", className)}
      aria-hidden="true"
    />
  )
}
