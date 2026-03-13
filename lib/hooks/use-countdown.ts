'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseCountdownReturn {
  seconds: number
  minutes: number
  remainingSeconds: number
  formatted: string
  isRunning: boolean
  isFinished: boolean
  start: () => void
  stop: () => void
  reset: (newSeconds?: number) => void
  restart: (newSeconds?: number) => void
}

export function useCountdown(initialSeconds: number, autoStart = false): UseCountdownReturn {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(autoStart)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Store initialSeconds in ref to avoid stale closure in callbacks
  const initialSecondsRef = useRef(initialSeconds)
  useEffect(() => { initialSecondsRef.current = initialSeconds }, [initialSeconds])

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback((): void => { setIsRunning(true) }, [])
  const stop = useCallback((): void => { setIsRunning(false) }, [])

  const reset = useCallback((newSeconds?: number): void => {
    clearTimer()
    setSeconds(newSeconds ?? initialSecondsRef.current)
    setIsRunning(false)
  }, [clearTimer])

  const restart = useCallback((newSeconds?: number): void => {
    clearTimer()
    setSeconds(newSeconds ?? initialSecondsRef.current)
    setIsRunning(true)
  }, [clearTimer])

  // #35/#168 — All deps included; uses functional setState to avoid stale `seconds`
  // #60/#174/#184 — cleanup guaranteed on every unmount path via clearTimer
  useEffect(() => {
    if (!isRunning) {
      clearTimer()
      return
    }

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return clearTimer
  }, [isRunning, clearTimer])

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  const formatted = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`

  return {
    seconds,
    minutes,
    remainingSeconds,
    formatted,
    isRunning,
    isFinished: seconds === 0 && !isRunning,
    start,
    stop,
    reset,
    restart,
  }
}
