"use client"

// L-07 FIX: Local error boundary for sensitive pages (wallet, transactions, etc.).
// The root error.tsx catches unhandled errors for the whole tree, but sensitive
// financial pages should have a local boundary so one broken widget doesn't
// crash the entire page — other sections remain usable.

import { Component, type ReactNode } from "react"
import { Warning } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  children: ReactNode
  fallbackTitle?: string
  fallbackDescription?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class LocalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    // Log to console in dev; replace with your error tracking (Sentry, etc.) in prod
    console.error("[LocalErrorBoundary] Caught error:", error)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="my-4">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <Warning className="size-8 text-destructive" />
            <div>
              <p className="font-medium text-sm">
                {this.props.fallbackTitle ?? "Terjadi kesalahan"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {this.props.fallbackDescription ?? "Bagian ini tidak dapat dimuat. Coba lagi."}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={this.handleRetry}>
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
