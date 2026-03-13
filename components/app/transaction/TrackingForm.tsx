"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"

interface TrackingFormData {
  trackingNumber: string
  courierName: string
  trackingNotes: string
}

interface TrackingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  form: TrackingFormData
  onFormChange: (updater: (prev: TrackingFormData) => TrackingFormData) => void
  onSubmit: () => void
  isPending: boolean
  submitLabel?: string
  pendingLabel?: string
}

export function TrackingForm({
  open,
  onOpenChange,
  title = "Kirim Barang",
  description = "Masukkan informasi pengiriman untuk transaksi ini.",
  form,
  onFormChange,
  onSubmit,
  isPending,
  submitLabel = "Konfirmasi Pengiriman",
  pendingLabel = "Mengirim...",
}: TrackingFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trackingNumber">Nomor Resi</Label>
            <Input
              id="trackingNumber"
              placeholder="Masukkan nomor resi"
              value={form.trackingNumber}
              onChange={(e) => onFormChange((f) => ({ ...f, trackingNumber: e.target.value }))}
              data-testid="input-tracking-number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="courierName">Nama Kurir</Label>
            <Input
              id="courierName"
              placeholder="Contoh: JNE, SiCepat, J&T"
              value={form.courierName}
              onChange={(e) => onFormChange((f) => ({ ...f, courierName: e.target.value }))}
              data-testid="input-courier-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trackingNotes">Catatan (Opsional)</Label>
            <Textarea
              id="trackingNotes"
              placeholder="Catatan tambahan pengiriman"
              value={form.trackingNotes}
              onChange={(e) => onFormChange((f) => ({ ...f, trackingNotes: e.target.value }))}
              data-testid="textarea-tracking-notes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-tracking">Batal</Button>
          <Button onClick={onSubmit} disabled={!form.trackingNumber || form.trackingNumber.trim().length < 1 || !form.courierName || isPending} data-testid="button-submit-tracking">
            {isPending ? pendingLabel : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
