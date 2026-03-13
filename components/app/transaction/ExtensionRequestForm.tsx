"use client"

import * as React from "react"
import { Clock, Check, X } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { formatRelative } from "@/lib/date"
import type { OrderExtensionRequest } from "@/types/transaction"

interface ExtensionFormData {
  extensionDays: number
  reason: string
}

interface ExtensionRequestFormProps {
  extensionDialogOpen: boolean
  onExtensionDialogChange: (open: boolean) => void
  extForm: ExtensionFormData
  onExtFormChange: (updater: (prev: ExtensionFormData) => ExtensionFormData) => void
  onSubmitExtension: () => void
  extensionPending: boolean
  respondExtDialogOpen: boolean
  onRespondExtDialogChange: (open: boolean) => void
  respondAction: "APPROVE" | "REJECT"
  respondNote: string
  onRespondNoteChange: (note: string) => void
  onRespondExtension: () => void
  respondPending: boolean
  extensions?: OrderExtensionRequest[]
  isBuyer: boolean
  isSeller: boolean
  onOpenRespondDialog: (extId: string, action: "APPROVE" | "REJECT") => void
}

export function ExtensionRequestForm({
  extensionDialogOpen,
  onExtensionDialogChange,
  extForm,
  onExtFormChange,
  onSubmitExtension,
  extensionPending,
  respondExtDialogOpen,
  onRespondExtDialogChange,
  respondAction,
  respondNote,
  onRespondNoteChange,
  onRespondExtension,
  respondPending,
  extensions,
  isBuyer,
  isSeller,
  onOpenRespondDialog,
}: ExtensionRequestFormProps) {
  return (
    <>
      {extensions && extensions.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Permintaan Perpanjangan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {extensions.map((ext) => (
              <div key={ext.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{ext.extensionDays} hari</span>
                    <Badge variant={ext.status === "APPROVED" ? "default" : ext.status === "REJECTED" ? "destructive" : ext.status === "EXPIRED" ? "secondary" : "outline"}>
                      {ext.status === "PENDING" ? "Menunggu" : ext.status === "APPROVED" ? "Disetujui" : ext.status === "REJECTED" ? "Ditolak" : "Kedaluwarsa"}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatRelative(ext.createdAt)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{ext.reason}</p>
                {ext.rejectionNote && (
                  <p className="text-sm text-destructive">Catatan: {ext.rejectionNote}</p>
                )}
                {ext.status === "PENDING" && (
                  (ext.requestedByRole === "BUYER" && isSeller) || (ext.requestedByRole === "SELLER" && isBuyer)
                ) && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onOpenRespondDialog(ext.id, "APPROVE")}
                      data-testid={`button-approve-extension-${ext.id}`}
                    >
                      <Check className="mr-1 size-3" />
                      Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onOpenRespondDialog(ext.id, "REJECT")}
                      data-testid={`button-reject-extension-${ext.id}`}
                    >
                      <X className="mr-1 size-3" />
                      Tolak
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={extensionDialogOpen} onOpenChange={onExtensionDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Minta Perpanjangan Waktu</DialogTitle>
            <DialogDescription>Ajukan perpanjangan deadline untuk transaksi ini.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="extensionDays">Jumlah Hari</Label>
              <Input
                id="extensionDays"
                type="number"
                min={1}
                max={30}
                value={extForm.extensionDays}
                data-testid="input-extension-days"
                onChange={(e) => {
                  // H-9 FIX: Clamp value to valid range [1, 30] before storing.
                  // Previously parseInt(e.target.value) || 1 had no upper bound,
                  // allowing values > 30 to be submitted (bypassing extensionRequestSchema.max(30)).
                  const raw = parseInt(e.target.value, 10)
                  const clamped = Number.isFinite(raw) ? Math.min(Math.max(raw, 1), 30) : 1
                  onExtFormChange((f) => ({ ...f, extensionDays: clamped }))
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="extensionReason">Alasan</Label>
              <Textarea
                id="extensionReason"
                placeholder="Jelaskan alasan perpanjangan waktu"
                value={extForm.reason}
                onChange={(e) => onExtFormChange((f) => ({ ...f, reason: e.target.value }))}
                data-testid="textarea-extension-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onExtensionDialogChange(false)} data-testid="button-cancel-extension">Batal</Button>
            <Button onClick={onSubmitExtension} disabled={!extForm.reason || extensionPending} data-testid="button-submit-extension">
              {extensionPending ? "Mengirim..." : "Ajukan Perpanjangan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={respondExtDialogOpen} onOpenChange={onRespondExtDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{respondAction === "APPROVE" ? "Setujui Perpanjangan" : "Tolak Perpanjangan"}</DialogTitle>
            <DialogDescription>
              {respondAction === "APPROVE"
                ? "Apakah Anda yakin ingin menyetujui permintaan perpanjangan ini?"
                : "Apakah Anda yakin ingin menolak permintaan perpanjangan ini?"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="respondNote">Catatan (Opsional)</Label>
              <Textarea
                id="respondNote"
                placeholder="Tambahkan catatan"
                value={respondNote}
                onChange={(e) => onRespondNoteChange(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onRespondExtDialogChange(false)} data-testid="button-cancel-respond-extension">Batal</Button>
            <Button
              variant={respondAction === "REJECT" ? "destructive" : "default"}
              onClick={onRespondExtension}
              disabled={respondPending}
              data-testid="button-confirm-respond-extension"
            >
              {respondPending ? "Memproses..." : respondAction === "APPROVE" ? "Setujui" : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
