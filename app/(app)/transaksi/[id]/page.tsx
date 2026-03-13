"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Star } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { LoadingState, ErrorState, PageHeader, PageTransition } from "@/components/shared"
import { LocalErrorBoundary } from "@/shared/components/shared/LocalErrorBoundary"
import { TransactionStatusBadge } from "@/components/app/transaction/TransactionStatusBadge"
import { TransactionTimeline } from "@/components/app/transaction/TransactionTimeline"
import { TransactionParties } from "@/components/app/transaction/TransactionParties"
import { TransactionActions } from "@/components/app/transaction/TransactionActions"
import { EscrowStatusCard } from "@/components/app/transaction/EscrowStatusCard"
import { TrackingForm } from "@/components/app/transaction/TrackingForm"
import { ExtensionRequestForm } from "@/components/app/transaction/ExtensionRequestForm"
import {
  useTransactionDetail,
  useConfirmTransaction,
  useRejectTransaction,
  usePayTransaction,
  useCompleteTransaction,
  useCancelTransaction,
  useShipTransaction,
  useUpdateShipping,
  useRequestExtension,
  useOrderExtensions,
  useOrderHistory,
  useRespondExtension,
} from "@/lib/hooks/use-transactions"
import { useSubmitRating } from "@/lib/hooks/use-rating"
import { formatIDR } from "@/lib/currency"
import { ROUTES } from "@/lib/constants"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { useAuthStore } from "@/lib/stores/auth.store"

// #41/#252 — useReducer replaces 10+ useState for dialog/form state
interface DialogState {
  shipOpen: boolean
  updateShipOpen: boolean
  extensionOpen: boolean
  ratingOpen: boolean
  respondExtOpen: boolean
  selectedExtension: string | null
  respondAction: "APPROVE" | "REJECT"
}

type DialogAction =
  | { type: "OPEN_SHIP" }
  | { type: "CLOSE_SHIP" }
  | { type: "OPEN_UPDATE_SHIP" }
  | { type: "CLOSE_UPDATE_SHIP" }
  | { type: "OPEN_EXTENSION" }
  | { type: "CLOSE_EXTENSION" }
  | { type: "OPEN_RATING" }
  | { type: "CLOSE_RATING" }
  | { type: "OPEN_RESPOND_EXT"; extId: string; action: "APPROVE" | "REJECT" }
  | { type: "CLOSE_RESPOND_EXT" }

const initialDialogState: DialogState = {
  shipOpen: false,
  updateShipOpen: false,
  extensionOpen: false,
  ratingOpen: false,
  respondExtOpen: false,
  selectedExtension: null,
  respondAction: "APPROVE",
}

function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case "OPEN_SHIP": return { ...state, shipOpen: true }
    case "CLOSE_SHIP": return { ...state, shipOpen: false }
    case "OPEN_UPDATE_SHIP": return { ...state, updateShipOpen: true }
    case "CLOSE_UPDATE_SHIP": return { ...state, updateShipOpen: false }
    case "OPEN_EXTENSION": return { ...state, extensionOpen: true }
    case "CLOSE_EXTENSION": return { ...state, extensionOpen: false }
    case "OPEN_RATING": return { ...state, ratingOpen: true }
    case "CLOSE_RATING": return { ...state, ratingOpen: false }
    case "OPEN_RESPOND_EXT": return { ...state, respondExtOpen: true, selectedExtension: action.extId, respondAction: action.action }
    case "CLOSE_RESPOND_EXT": return { ...state, respondExtOpen: false, selectedExtension: null }
    default: return state
  }
}

const EMPTY_SHIP_FORM = { trackingNumber: "", courierName: "", trackingNotes: "" }
const EMPTY_EXT_FORM = { extensionDays: 3, reason: "" }
const EMPTY_RATING_FORM = { stars: 5, comment: "" }

export default function TransactionDetailPage() {
  usePageTitle("Detail Transaksi")
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { data: order, isLoading, isError, refetch } = useTransactionDetail(id)

  const confirmMutation = useConfirmTransaction()
  const rejectMutation = useRejectTransaction()
  const payMutation = usePayTransaction()
  const completeMutation = useCompleteTransaction()
  const cancelMutation = useCancelTransaction()
  const shipMutation = useShipTransaction()
  const updateShippingMutation = useUpdateShipping()
  const extensionMutation = useRequestExtension()
  const respondExtensionMutation = useRespondExtension()
  const ratingMutation = useSubmitRating()

  // #070 FIX: Track loading state for sub-fetches so sub-components
  // don't display empty/undefined state before data arrives.
  const { data: extensions, isLoading: extensionsLoading } = useOrderExtensions(id)
  const { data: orderHistory, isLoading: historyLoading } = useOrderHistory(id)

  // #41/#252 — All dialog state managed in single reducer
  const [dialogs, dispatch] = React.useReducer(dialogReducer, initialDialogState)
  const [shipForm, setShipForm] = React.useState(EMPTY_SHIP_FORM)
  const [updateShipForm, setUpdateShipForm] = React.useState(EMPTY_SHIP_FORM)
  const [extForm, setExtForm] = React.useState(EMPTY_EXT_FORM)
  const [ratingForm, setRatingForm] = React.useState(EMPTY_RATING_FORM)
  const [respondNote, setRespondNote] = React.useState("")

  if (isLoading) return <LoadingState fullPage text="Memuat detail transaksi..." />
  if (isError || !order) return <ErrorState title="Gagal Memuat Detail" onRetry={() => refetch()} />

  // #34 — Memoize derived booleans; #19 — safe optional chaining instead of user!.userId
  const userId = user?.userId ?? user?.id
  const isBuyer = React.useMemo(() => userId === order.buyer?.userId, [userId, order.buyer?.userId])
  const isSeller = React.useMemo(() => userId === order.seller?.userId, [userId, order.seller?.userId])

  // #32 — All handlers wrapped with useCallback
  const handleShip = React.useCallback(() => {
    shipMutation.mutate(
      { id, data: shipForm },
      { onSuccess: () => { dispatch({ type: "CLOSE_SHIP" }); setShipForm(EMPTY_SHIP_FORM) } }
    )
  }, [id, shipForm, shipMutation])

  const handleUpdateShipping = React.useCallback(() => {
    updateShippingMutation.mutate(
      { id, data: updateShipForm },
      { onSuccess: () => { dispatch({ type: "CLOSE_UPDATE_SHIP" }); setUpdateShipForm(EMPTY_SHIP_FORM) } }
    )
  }, [id, updateShipForm, updateShippingMutation])

  const handleRequestExtension = React.useCallback(() => {
    extensionMutation.mutate(
      { id, data: extForm },
      { onSuccess: () => { dispatch({ type: "CLOSE_EXTENSION" }); setExtForm(EMPTY_EXT_FORM) } }
    )
  }, [id, extForm, extensionMutation])

  const handleSubmitRating = React.useCallback(() => {
    ratingMutation.mutate(
      { orderId: id, data: ratingForm },
      { onSuccess: () => { dispatch({ type: "CLOSE_RATING" }); setRatingForm(EMPTY_RATING_FORM) } }
    )
  }, [id, ratingForm, ratingMutation])

  const handleRespondExtension = React.useCallback(() => {
    if (!dialogs.selectedExtension) return
    respondExtensionMutation.mutate(
      { id, extId: dialogs.selectedExtension, data: { action: dialogs.respondAction, note: respondNote || undefined } },
      { onSuccess: () => { dispatch({ type: "CLOSE_RESPOND_EXT" }); setRespondNote("") } }
    )
  }, [id, dialogs.selectedExtension, dialogs.respondAction, respondNote, respondExtensionMutation])

  const openUpdateShipDialog = React.useCallback(() => {
    setUpdateShipForm({
      trackingNumber: order.trackingNumber ?? "",
      courierName: order.courierName ?? "",
      trackingNotes: order.trackingNotes ?? "",
    })
    dispatch({ type: "OPEN_UPDATE_SHIP" })
  }, [order.trackingNumber, order.courierName, order.trackingNotes])

  const handleOpenRespondDialog = React.useCallback((extId: string, action: "APPROVE" | "REJECT") => {
    setRespondNote("")
    dispatch({ type: "OPEN_RESPOND_EXT", extId, action })
  }, [])

  const handleOpenShip = React.useCallback(() => dispatch({ type: "OPEN_SHIP" }), [])
  const handleOpenExtension = React.useCallback(() => dispatch({ type: "OPEN_EXTENSION" }), [])
  const handleOpenRating = React.useCallback(() => dispatch({ type: "OPEN_RATING" }), [])

  const handleSetShipOpen = React.useCallback((open: boolean) => {
    dispatch({ type: open ? "OPEN_SHIP" : "CLOSE_SHIP" })
  }, [])
  const handleSetExtOpen = React.useCallback((open: boolean) => {
    dispatch({ type: open ? "OPEN_EXTENSION" : "CLOSE_EXTENSION" })
  }, [])
  const handleSetRespondExtOpen = React.useCallback((open: boolean) => {
    if (!open) dispatch({ type: "CLOSE_RESPOND_EXT" })
  }, [])
  const handleSetRatingOpen = React.useCallback((open: boolean) => {
    dispatch({ type: open ? "OPEN_RATING" : "CLOSE_RATING" })
  }, [])
  const handleSetUpdateShipOpen = React.useCallback((open: boolean) => {
    dispatch({ type: open ? "OPEN_UPDATE_SHIP" : "CLOSE_UPDATE_SHIP" })
  }, [])

  return (
    <LocalErrorBoundary fallbackTitle="Gagal Memuat Transaksi" fallbackDescription="Detail transaksi tidak dapat dimuat. Coba lagi.">
    <PageTransition className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex items-center gap-1.5">
          <li><Link href={ROUTES.TRANSACTIONS} className="hover:text-foreground transition-colors">Transaksi</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground font-medium truncate max-w-[200px]">{order.title}</li>
        </ol>
      </nav>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-xl border border-border bg-muted hover:bg-muted/80"
          onClick={() => router.push(ROUTES.TRANSACTIONS)}
          aria-label="Kembali ke daftar transaksi"
          data-testid="button-transaction-detail-back"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Button>
        <PageHeader
          title={order.title}
          description={`Order ${order.orderId}`}
          action={<TransactionStatusBadge status={order.status} />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Detail Transaksi</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><p className="text-xs text-muted-foreground">Jenis</p><p className="text-sm font-medium">{order.orderType}</p></div>
                <div><p className="text-xs text-muted-foreground">Nilai Transaksi</p><p className="text-sm font-semibold">{formatIDR(order.orderValue)}</p></div>
                <div><p className="text-xs text-muted-foreground">Biaya Platform</p><p className="text-sm">{formatIDR(order.feeAmount)}</p></div>
                <div><p className="text-xs text-muted-foreground">Penanggung Biaya</p><p className="text-sm">{order.feeResponsibility === "BUYER" ? "Pembeli" : order.feeResponsibility === "SELLER" ? "Penjual" : "Bagi Rata"}</p></div>
              </div>
              <Separator />
              <div><p className="text-xs text-muted-foreground">Deskripsi</p><p className="text-sm">{order.description}</p></div>
              {order.trackingNumber && (
                <>
                  <Separator />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div><p className="text-xs text-muted-foreground">Nomor Resi</p><p className="text-sm font-mono">{order.trackingNumber}</p></div>
                    <div><p className="text-xs text-muted-foreground">Kurir</p><p className="text-sm">{order.courierName}</p></div>
                  </div>
                  {order.trackingNotes && (
                    <div><p className="text-xs text-muted-foreground">Catatan Pengiriman</p><p className="text-sm">{order.trackingNotes}</p></div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <TransactionParties buyer={order.buyer} seller={order.seller} />

          <ExtensionRequestForm
            extensionDialogOpen={dialogs.extensionOpen}
            onExtensionDialogChange={handleSetExtOpen}
            extForm={extForm}
            onExtFormChange={setExtForm}
            onSubmitExtension={handleRequestExtension}
            extensionPending={extensionMutation.isPending}
            respondExtDialogOpen={dialogs.respondExtOpen}
            onRespondExtDialogChange={handleSetRespondExtOpen}
            respondAction={dialogs.respondAction}
            respondNote={respondNote}
            onRespondNoteChange={setRespondNote}
            onRespondExtension={handleRespondExtension}
            respondPending={respondExtensionMutation.isPending}
            extensions={extensions ?? undefined}
            isBuyer={isBuyer}
            isSeller={isSeller}
            onOpenRespondDialog={handleOpenRespondDialog}
          />

          <TransactionTimeline histories={order.statusHistories} />
        </div>

        <div className="space-y-6">
          <EscrowStatusCard order={order} />

          <TransactionActions
            order={order}
            isBuyer={isBuyer}
            isSeller={isSeller}
            confirmMutation={confirmMutation}
            rejectMutation={rejectMutation}
            payMutation={payMutation}
            completeMutation={completeMutation}
            cancelMutation={cancelMutation}
            onShipClick={handleOpenShip}
            onUpdateShipClick={openUpdateShipDialog}
            onExtensionClick={handleOpenExtension}
            onRatingClick={handleOpenRating}
          />
        </div>
      </div>

      <TrackingForm
        open={dialogs.shipOpen}
        onOpenChange={handleSetShipOpen}
        title="Kirim Barang"
        description="Masukkan informasi pengiriman untuk transaksi ini."
        form={shipForm}
        onFormChange={setShipForm}
        onSubmit={handleShip}
        isPending={shipMutation.isPending}
        submitLabel="Konfirmasi Pengiriman"
        pendingLabel="Mengirim..."
      />

      <TrackingForm
        open={dialogs.updateShipOpen}
        onOpenChange={handleSetUpdateShipOpen}
        title="Perbarui Info Pengiriman"
        description="Perbarui informasi pengiriman untuk transaksi ini."
        form={updateShipForm}
        onFormChange={setUpdateShipForm}
        onSubmit={handleUpdateShipping}
        isPending={updateShippingMutation.isPending}
        submitLabel="Perbarui"
        pendingLabel="Memperbarui..."
      />

      <Dialog open={dialogs.ratingOpen} onOpenChange={handleSetRatingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beri Rating</DialogTitle>
            <DialogDescription>Berikan penilaian Anda untuk transaksi ini.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label id="rating-label">Rating</Label>
              <div className="flex gap-1" role="group" aria-labelledby="rating-label">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingForm((f) => ({ ...f, stars: star }))}
                    aria-label={`${star} bintang`}
                    aria-pressed={star <= ratingForm.stars}
                    className="p-1 hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    <Star
                      className="size-8"
                      weight={star <= ratingForm.stars ? "fill" : "regular"}
                      color={star <= ratingForm.stars ? "#f59e0b" : "#d1d5db"}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{ratingForm.stars} dari 5 bintang</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ratingComment">Komentar (Opsional)</Label>
              <Textarea
                id="ratingComment"
                placeholder="Tulis komentar tentang pengalaman Anda"
                value={ratingForm.comment}
                onChange={(e) => setRatingForm((f) => ({ ...f, comment: e.target.value }))}
                maxLength={500}
                data-testid="textarea-rating-comment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => dispatch({ type: "CLOSE_RATING" })} data-testid="button-cancel-rating">Batal</Button>
            <Button onClick={handleSubmitRating} disabled={ratingMutation.isPending} data-testid="button-submit-rating">
              {ratingMutation.isPending ? "Mengirim..." : "Kirim Rating"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
    </LocalErrorBoundary>
  )
}
