"use client"

import { useState } from "react"
import { FileText, ArrowSquareOut } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatRelative } from "@/lib/date"
import { useUploadFile } from "@/lib/hooks/use-upload"
import { toast } from "sonner"
import type { DisputeEvidence } from "@/types/dispute"

interface DisputeEvidenceListProps {
  evidences: DisputeEvidence[]
}

export function DisputeEvidenceList({ evidences }: DisputeEvidenceListProps) {
  if (!evidences || evidences.length === 0) return null

  return (
    <Card>
      <CardHeader><CardTitle>Bukti</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {evidences.map((evidence: DisputeEvidence) => (
          <div key={evidence.id} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Dikirim oleh {evidence.submittedByRole === "BUYER" ? "Pembeli" : evidence.submittedByRole === "SELLER" ? "Penjual" : "Admin"}
              </span>
              <span className="text-xs text-muted-foreground">{formatRelative(evidence.createdAt)}</span>
            </div>
            <p className="text-sm">{evidence.description}</p>
            {(evidence.fileUrls ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(evidence.fileUrls ?? []).map((url, i) => (
                  <a key={url || `bukti-${i}`} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-muted">
                    <FileText className="size-3" />
                    Bukti {i + 1}
                    <ArrowSquareOut className="size-3" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface DisputeSubmitEvidenceProps {
  isPending: boolean
  onSubmit: (data: { description: string; fileUrls: string[]; fileTypes: string[] }) => void
}

const MAX_FILES = 5
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf", "video/mp4", "text/plain"]
const MAX_SIZE_MB = 5

// BUG-H01 FIX: Replace raw URL input fields with real file upload.
// Previously this component asked users to type pre-signed URLs manually —
// entirely unusable in practice. Now uses useUploadFile (same pattern as DisputeForm).
export function DisputeSubmitEvidence({ isPending, onSubmit }: DisputeSubmitEvidenceProps) {
  const [description, setDescription] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const uploadFile = useUploadFile()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_FILES - selectedFiles.length
    const valid = files.filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        toast.error(`${f.name}: format tidak didukung`)
        return false
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${f.name}: ukuran melebihi ${MAX_SIZE_MB}MB`)
        return false
      }
      return true
    })
    setSelectedFiles((prev) => [...prev, ...valid.slice(0, remaining)])
    e.target.value = ""
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Deskripsi bukti tidak boleh kosong.")
      return
    }

    let fileUrls: string[] = []
    let fileTypes: string[] = []

    if (selectedFiles.length > 0) {
      setIsUploading(true)
      try {
        const uploaded = await Promise.all(
          selectedFiles.map((file) => uploadFile.mutateAsync({ file, folder: "dispute" }))
        )
        fileUrls = uploaded
        fileTypes = selectedFiles.map((f) => f.type)
      } catch {
        toast.error("Gagal mengupload file. Silakan coba lagi.")
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    onSubmit({ description, fileUrls, fileTypes })
    setDescription("")
    setSelectedFiles([])
  }

  const isProcessing = isPending || isUploading

  return (
    <Card>
      <CardHeader><CardTitle>Kirim Bukti</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="evidence-description">Deskripsi</Label>
          <Textarea
            id="evidence-description"
            placeholder="Jelaskan bukti yang Anda kirim..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            data-testid="textarea-evidence-description"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">
            File Bukti <span className="text-muted-foreground font-normal">(opsional, maks. {MAX_FILES} file)</span>
          </p>
          {selectedFiles.length > 0 && (
            <ul className="space-y-1">
              {selectedFiles.map((file, i) => (
                <li
                  key={`${file.name}-${file.lastModified}`}
                  className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
                >
                  <span className="truncate max-w-[240px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Hapus file ${file.name}`}
                    data-testid={`button-remove-evidence-file-${i}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selectedFiles.length < MAX_FILES && (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted/30 transition-colors">
              + Lampirkan File
              <input
                type="file"
                className="sr-only"
                multiple
                accept={ACCEPTED_TYPES.join(",")}
                onChange={handleFileSelect}
                data-testid="input-evidence-files"
              />
            </label>
          )}
          <p className="text-xs text-muted-foreground">
            Format: JPG, PNG, WebP, PDF, MP4, TXT. Maks. {MAX_SIZE_MB}MB per file.
          </p>
        </div>

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!description.trim() || isProcessing}
          data-testid="button-submit-evidence"
        >
          {isUploading ? "Mengupload file..." : isPending ? "Mengirim..." : "Kirim Bukti"}
        </Button>
      </CardContent>
    </Card>
  )
}
