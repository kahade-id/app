"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Paperclip, X } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { submitDisputeClaimSchema, type SubmitDisputeClaimInput } from "@/lib/validations/dispute.schema"
import { useUploadFile } from "@/lib/hooks/use-upload"
import { toast } from "sonner"

interface DisputeFormProps {
  isPending: boolean
  onSubmit: (data: { claim: string; fileUrls?: string[] }) => void
}

const MAX_FILES = 5
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
const MAX_SIZE_MB = 5

export function DisputeForm({ isPending, onSubmit }: DisputeFormProps) {
  const form = useForm<SubmitDisputeClaimInput>({
    resolver: zodResolver(submitDisputeClaimSchema),
    defaultValues: { claim: "" },
  })

  // #10 FIX: Tambah file upload UI — sebelumnya schema mendukung fileUrls
  // tapi tidak ada UI untuk mengunggah bukti dispute
  const uploadFile = useUploadFile()
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [uploadedUrls, setUploadedUrls] = React.useState<string[]>([])
  const [isUploading, setIsUploading] = React.useState(false)

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
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (data: SubmitDisputeClaimInput) => {
    let finalUrls = uploadedUrls

    if (selectedFiles.length > uploadedUrls.length) {
      setIsUploading(true)
      try {
        const toUpload = selectedFiles.slice(uploadedUrls.length)
        const uploaded = await Promise.all(
          toUpload.map((file) => uploadFile.mutateAsync({ file, folder: "dispute" }))
        )
        finalUrls = [...uploadedUrls, ...uploaded]
        setUploadedUrls(finalUrls)
      } catch {
        toast.error("Gagal mengupload file. Silakan coba lagi.")
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    onSubmit({ claim: data.claim, fileUrls: finalUrls.length > 0 ? finalUrls : undefined })
  }

  const isProcessing = isPending || isUploading

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulir Dispute</CardTitle>
        <CardDescription>Jelaskan masalah yang Anda alami dengan transaksi ini secara detail</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="claim" render={({ field }) => (
              <FormItem>
                <FormLabel>Klaim Dispute</FormLabel>
                <FormControl>
                  <Textarea placeholder="Jelaskan masalah Anda secara detail (minimal 20 karakter)..." className="min-h-[150px]" data-testid="textarea-dispute-claim" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* #10 FIX: File upload UI untuk bukti dispute */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Bukti Pendukung <span className="text-muted-foreground font-normal">(opsional, maks. {MAX_FILES} file)</span></p>
              {selectedFiles.length > 0 && (
                <ul className="space-y-1">
                  {selectedFiles.map((file, i) => (
                    <li key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                      <span className="truncate max-w-[240px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={`Hapus file ${file.name}`}
                        data-testid={`button-remove-dispute-file-${i}`}
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {selectedFiles.length < MAX_FILES && (
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted/30 transition-colors">
                  <Paperclip className="size-4" />
                  Lampirkan File
                  <input
                    type="file"
                    className="sr-only"
                    multiple
                    accept={ACCEPTED_TYPES.join(",")}
                    onChange={handleFileSelect}
                    data-testid="input-dispute-files"
                  />
                </label>
              )}
              <p className="text-xs text-muted-foreground">Format: JPG, PNG, WebP, PDF. Maks. {MAX_SIZE_MB}MB per file.</p>
            </div>

            <Button type="submit" className="w-full" disabled={isProcessing} data-testid="button-submit-dispute">
              {isUploading ? "Mengupload bukti..." : isPending ? "Mengirim..." : "Ajukan Dispute"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
