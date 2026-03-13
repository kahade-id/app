"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChatCircle, Package, Clock, Star } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ROUTES, PAYMENT_METHOD_LABELS } from "@/lib/constants"
import { usePaymentMethods } from "@/lib/hooks/use-wallet"
// CRH-1 FIX: Added missing imports — ConfirmDialog, LoadingState, OTPInput were used but never imported,
// causing ReferenceError at runtime and crashing the entire transaction page.
import { ConfirmDialog, LoadingState, OTPInput } from "@/components/shared"
import type { Order } from "@/types/transaction"

interface TransactionActionsProps {
  order: Order
  isBuyer: boolean
  isSeller: boolean
  confirmMutation: { mutate: (id: string) => void; isPending: boolean }
  rejectMutation: { mutate: (args: { id: string }, opts?: { onSettled?: () => void }) => void; isPending: boolean }
  payMutation: { mutate: (args: { id: string; data: { paymentMethod: string; pin?: string } }, opts?: { onSuccess?: () => void }) => void; isPending: boolean }
  completeMutation: { mutate: (id: string, opts?: { onSuccess?: () => void }) => void; isPending: boolean }
  cancelMutation: { mutate: (args: { id: string }, opts?: { onSettled?: () => void }) => void; isPending: boolean }
  onShipClick: () => void
  onUpdateShipClick: () => void
  onExtensionClick: () => void
  onRatingClick: () => void
}

export function TransactionActions({
  order,
  isBuyer,
  isSeller,
  confirmMutation,
  rejectMutation,
  payMutation,
  completeMutation,
  cancelMutation,
  onShipClick,
  onUpdateShipClick,
  onExtensionClick,
  onRatingClick,
}: TransactionActionsProps) {
  const router = useRouter()
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false)
  const [payDialogOpen, setPayDialogOpen] = React.useState(false)
  const [completeDialogOpen, setCompleteDialogOpen] = React.useState(false)
  const [selectedMethod, setSelectedMethod] = React.useState("KAHADE_WALLET")
  // #9 FIX: PIN diperlukan untuk pembayaran via KAHADE_WALLET
  const [walletPin, setWalletPin] = React.useState("")
  const { data: paymentMethods, isLoading: methodsLoading } = usePaymentMethods()

  return (
    <>
      <Card>
        <CardHeader><CardTitle>Aksi</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {order.status === "WAITING_CONFIRMATION" && !isBuyer && (
            <>
              <Button className="w-full" onClick={() => confirmMutation.mutate(order.id)} disabled={confirmMutation.isPending} aria-label="Konfirmasi transaksi ini" data-testid="button-confirm-transaction">
                {confirmMutation.isPending ? "Mengkonfirmasi..." : "Konfirmasi Transaksi"}
              </Button>
              <Button variant="destructive" className="w-full" onClick={() => setRejectDialogOpen(true)} disabled={rejectMutation.isPending} aria-label="Tolak transaksi ini" data-testid="button-reject-transaction">
                Tolak Transaksi
              </Button>
            </>
          )}
          {order.status === "WAITING_PAYMENT" && isBuyer && (
            <Button className="w-full" onClick={() => setPayDialogOpen(true)} disabled={payMutation.isPending} aria-label="Bayar transaksi sekarang" data-testid="button-pay-transaction">
              {payMutation.isPending ? "Memproses pembayaran..." : "Bayar Sekarang"}
            </Button>
          )}
          {order.status === "PROCESSING" && isSeller && (
            <Button variant="outline" className="w-full" onClick={onShipClick} aria-label="Kirim barang untuk transaksi ini" data-testid="button-ship-order">
              <Package className="mr-2 size-4" />
              Kirim Barang
            </Button>
          )}
          {order.status === "IN_DELIVERY" && isBuyer && (
            <Button className="w-full" onClick={() => setCompleteDialogOpen(true)} disabled={completeMutation.isPending} aria-label="Konfirmasi transaksi selesai" data-testid="button-complete-transaction">
              {completeMutation.isPending ? "Memproses..." : "Konfirmasi Selesai"}
            </Button>
          )}
          {order.status === "IN_DELIVERY" && isSeller && order.trackingNumber && (
            <Button variant="outline" className="w-full" onClick={onUpdateShipClick} aria-label="Perbarui informasi pengiriman" data-testid="button-update-shipment">
              <Package className="mr-2 size-4" />
              Perbarui Info Pengiriman
            </Button>
          )}
          {["PROCESSING", "IN_DELIVERY"].includes(order.status) && (
            <Button variant="outline" className="w-full" onClick={onExtensionClick} aria-label="Minta perpanjangan waktu transaksi" data-testid="button-request-extension">
              <Clock className="mr-2 size-4" />
              Minta Perpanjangan
            </Button>
          )}
          {["WAITING_CONFIRMATION", "WAITING_PAYMENT"].includes(order.status) && (
            <Button variant="outline" className="w-full" onClick={() => setCancelDialogOpen(true)} disabled={cancelMutation.isPending} aria-label="Batalkan transaksi ini" data-testid="button-cancel-transaction">
              {cancelMutation.isPending ? "Membatalkan..." : "Batalkan"}
            </Button>
          )}
          {order.hasChatRoom && (
            <Button variant="outline" className="w-full" onClick={() => router.push(ROUTES.CHAT(order.id))} aria-label="Buka chat transaksi" data-testid="button-open-chat">
              <ChatCircle className="mr-2 size-4" />
              Buka Chat
            </Button>
          )}
          {order.status === "COMPLETED" && !order.hasRating && (
            <Button variant="outline" className="w-full" onClick={onRatingClick} aria-label="Beri rating untuk transaksi ini" data-testid="button-rate-transaction">
              <Star className="mr-2 size-4" />
              Beri Rating
            </Button>
          )}
          {!order.hasDispute && ["PROCESSING", "IN_DELIVERY"].includes(order.status) && (
            <Button variant="destructive" className="w-full" onClick={() => router.push(ROUTES.DISPUTE_NEW(order.id))} aria-label="Ajukan dispute untuk transaksi ini" data-testid="button-open-dispute">
              Ajukan Dispute
            </Button>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        title="Tolak Transaksi?"
        description="Apakah Anda yakin ingin menolak transaksi ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Tolak"
        variant="destructive"
        isLoading={rejectMutation.isPending}
        onConfirm={() => {
          rejectMutation.mutate({ id: order.id }, { onSettled: () => setRejectDialogOpen(false) })
        }}
      />

      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Batalkan Transaksi?"
        description="Apakah Anda yakin ingin membatalkan transaksi ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Batalkan"
        variant="destructive"
        isLoading={cancelMutation.isPending}
        onConfirm={() => {
          cancelMutation.mutate({ id: order.id }, { onSettled: () => setCancelDialogOpen(false) })
        }}
      />

      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
            <DialogDescription>
              Pilih cara pembayaran untuk transaksi ini.
            </DialogDescription>
          </DialogHeader>
          {methodsLoading ? (
            <LoadingState text="Memuat metode pembayaran..." />
          ) : (
            <div className="space-y-4">
              <RadioGroup value={selectedMethod} onValueChange={(v) => { setSelectedMethod(v); setWalletPin("") }} className="space-y-2">
                {(paymentMethods ?? []).filter((pm) => pm.enabled).map((pm) => (
                  <div key={pm.id} className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/30">
                    <RadioGroupItem value={pm.id} id={`pay-${pm.id}`} />
                    <Label htmlFor={`pay-${pm.id}`} className="cursor-pointer text-sm font-medium">{PAYMENT_METHOD_LABELS[pm.id] || pm.name}</Label>
                  </div>
                ))}
              </RadioGroup>
              {/* #9 FIX: Tampilkan input PIN saat metode KAHADE_WALLET dipilih */}
              {selectedMethod === "KAHADE_WALLET" && (
                <div className="space-y-2 pt-1">
                  <label htmlFor="pay-wallet-pin" className="block text-sm font-medium">
                    PIN Wallet
                  </label>
                  <OTPInput
                    id="pay-wallet-pin"
                    value={walletPin}
                    onChange={setWalletPin}
                    length={6}
                    disabled={payMutation.isPending}
                  />
                  <p className="text-xs text-muted-foreground">Masukkan PIN 6 digit wallet Anda untuk verifikasi pembayaran</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialogOpen(false)} data-testid="button-cancel-payment">Batal</Button>
            <Button
              data-testid="button-confirm-payment"
              onClick={() => {
                // #9 FIX: Sertakan PIN jika metode pembayaran KAHADE_WALLET
                const payData: { paymentMethod: string; pin?: string } = { paymentMethod: selectedMethod }
                if (selectedMethod === "KAHADE_WALLET") {
                  payData.pin = walletPin
                }
                payMutation.mutate(
                  { id: order.id, data: payData },
                  { onSuccess: () => { setPayDialogOpen(false); setWalletPin("") } },
                )
              }}
              disabled={
                payMutation.isPending ||
                (selectedMethod === "KAHADE_WALLET" && walletPin.length !== 6)
              }
            >
              {payMutation.isPending ? "Memproses..." : "Bayar Sekarang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        title="Selesaikan Transaksi?"
        description="Apakah Anda yakin transaksi ini sudah selesai? Dana escrow akan dilepaskan kepada penjual. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Konfirmasi Selesai"
        isLoading={completeMutation.isPending}
        onConfirm={() => {
          // BUG-012 FIX: Don't close dialog synchronously — wait for mutation onSuccess
          // to avoid leaving user without feedback if the request fails.
          // completeMutation hook's onSuccess will invalidate queries and show toast.
          completeMutation.mutate(order.id, {
            onSuccess: () => setCompleteDialogOpen(false),
          })
        }}
      />
    </>
  )
}
