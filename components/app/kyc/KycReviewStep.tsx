"use client"

import { FileText, UploadSimple, Camera } from "@phosphor-icons/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface KycReviewStepProps {
  nik: string
  ktpFile: File | null
  selfieFile: File | null
}

export function KycReviewStep({ nik, ktpFile, selfieFile }: KycReviewStepProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted">
            <FileText className="size-4 text-foreground/70" />
          </div>
          Ringkasan Data
        </CardTitle>
        <CardDescription>Pastikan data berikut sudah benar sebelum dikirim</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">NIK</p>
            <p className="truncate text-sm font-medium">{nik}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <UploadSimple className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Foto KTP</p>
            <p className="truncate text-sm font-medium">{ktpFile?.name ?? "-"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Camera className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Foto Selfie</p>
            <p className="truncate text-sm font-medium">{selfieFile?.name ?? "-"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
