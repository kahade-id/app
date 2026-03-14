'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'

export function useCopy(duration = 2000) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success('Berhasil disalin!')
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => setCopied(false), duration)
      } catch {
        toast.error('Gagal menyalin')
      }
    },
    [duration]
  )

  return { copied, copy }
}
