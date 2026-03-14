"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Warning, ArrowsClockwise, House, Chat } from "@phosphor-icons/react"
import { ROUTES } from "@/lib/constants"

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

// #208 — Remove console.error from production; use structured error reporting
function reportError(error: Error & { digest?: string }): void {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", { message: error.message, digest: error.digest, stack: error.stack })
  }
  // Production: send to error tracking service (e.g. Sentry)
  // if (typeof window !== "undefined" && window.__errorTracker) {
  //   window.__errorTracker.captureException(error)
  // }
}

export default function ErrorPage({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    reportError(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border bg-destructive/10 border-destructive/30"
          aria-hidden="true"
        >
          <Warning className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-4">
          Terjadi Kesalahan
        </h1>
        <p className="text-muted-foreground mb-2">
          Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba
          lagi atau hubungi tim support kami.
        </p>
        {(error.digest || error.message) && (
          <div className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 mb-6 font-mono break-all space-y-1 text-left">
            {error.digest && <p><span className="font-semibold">Error ID:</span> {error.digest}</p>}
            {error.message && <p><span className="font-semibold">Detail:</span> {error.message}</p>}
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-testid="button-error-retry"
          >
            <ArrowsClockwise className="w-4 h-4" aria-hidden="true" />
            Coba Lagi
          </button>
          <Link
            href={ROUTES.DASHBOARD}
            className="inline-flex items-center gap-2 border border-border px-5 py-2.5 rounded-lg font-medium hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <House className="w-4 h-4" aria-hidden="true" />
            Ke Dashboard
          </Link>
        </div>
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">Butuh bantuan?</p>
          <a
            href="mailto:support@kahade.id"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Chat className="w-4 h-4" aria-hidden="true" />
            Hubungi Support
          </a>
        </div>
      </div>
    </div>
  )
}
