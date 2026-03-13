'use client'

import { useState, useEffect } from 'react'

// #44/#166 — useLayoutEffect replaced with useEffect (no DOM measurement needed)
// #298 — Proper SSR support: initial state false when window unavailable
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)

    const handleChange = (event: MediaQueryListEvent): void => {
      setIsMobile(event.matches)
    }

    // Set initial value after mount (SSR-safe)
    setIsMobile(mediaQuery.matches)

    // Use modern API (addEventListener) over deprecated addListener
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [breakpoint])

  return isMobile
}
