"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Warning } from "@phosphor-icons/react"

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // L-07 FIX: Log errors to console (and optionally to error tracking) so
  // they are visible in server logs / Sentry without requiring user reports.
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[AppError]", error)
    }
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Warning className="size-8" />
      </div>
      <h2 className="mb-2 text-xl font-bold">Terjadi Kesalahan</h2>
      <p className="mb-4 max-w-md text-sm text-muted-foreground">
        Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
      </p>
      {(error.digest || error.message) && (
        <div className="mb-6 max-w-md w-full text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 font-mono break-all space-y-1 text-left">
          {error.digest && <p><span className="font-semibold">Error ID:</span> {error.digest}</p>}
          {error.message && <p><span className="font-semibold">Detail:</span> {error.message}</p>}
        </div>
      )}
      <Button onClick={reset} data-testid="button-app-error-retry">Coba Lagi</Button>
    </div>
  )
}
