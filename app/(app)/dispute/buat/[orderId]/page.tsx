"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { PageHeader, PageTransition } from "@/components/shared"
import { DisputeForm } from "@/components/app/dispute/DisputeForm"
import { useSubmitClaim } from "@/lib/hooks/use-dispute"
import { ROUTES } from "@/lib/constants"

export default function BuatDisputePage() {
  const { orderId } = useParams<{ orderId: string }>()
  const router = useRouter()
  const submitClaim = useSubmitClaim()
  const [canGoBack, setCanGoBack] = React.useState(false)

  React.useEffect(() => {
    setCanGoBack(window.history.length > 1)
  }, [])

  const handleSubmit = (data: { claim: string }) => {
    // BUG-006 FIX: Removed onSuccess callback here — useSubmitClaim hook already
    // handles redirect to ROUTES.DISPUTE_DETAIL(id). Having two onSuccess handlers
    // in TanStack Query v5 caused double redirects.
    submitClaim.mutate({ orderId, data: { claim: data.claim } })
  }

  // #033 FIX: Validate orderId format before displaying it.
  // Raw URL params should be validated; malformed IDs would display strangely.
  const ORDER_ID_REGEX = /^ORD-\d{8}-[A-Z0-9]{4,10}$/
  const isValidOrderId = ORDER_ID_REGEX.test(orderId)

  return (
    <PageTransition className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Kembali" className="shrink-0 rounded-xl border border-border bg-muted hover:bg-muted/80" onClick={() => { if (canGoBack) { router.back() } else { router.push(ROUTES.DISPUTES) } }} data-testid="button-dispute-create-back">
          <ArrowLeft className="size-4" />
        </Button>
        <PageHeader
          title="Ajukan Dispute"
          description={isValidOrderId ? `Order: ${orderId}` : "Order tidak valid"}
        />
      </div>

      <DisputeForm isPending={submitClaim.isPending} onSubmit={handleSubmit} />
    </PageTransition>
  )
}
