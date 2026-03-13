"use client"

import { UploadSimple } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileUpload } from "@/components/shared"
import { ACCEPTED_IMAGE_TYPES, MAX_KYC_FILE_SIZE_MB } from "@/lib/constants"

interface KycUploadStepProps {
  file: File | null
  onFileChange: (file: File | null) => void
  onBack: () => void
  onNext: () => void
}

export function KycUploadStep({ file, onFileChange, onBack, onNext }: KycUploadStepProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted">
            <UploadSimple className="size-4 text-foreground/70" />
          </div>
          Foto KTP
        </CardTitle>
        <CardDescription>Unggah foto KTP Anda yang jelas dan tidak terpotong</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <FileUpload
          value={file}
          onChange={(f) => {
            const selected = Array.isArray(f) ? f[0] : f
            onFileChange(selected)
          }}
          accept={ACCEPTED_IMAGE_TYPES}
          maxSizeMB={MAX_KYC_FILE_SIZE_MB}
          label="Unggah Foto KTP"
          description={`Format: JPG, PNG, WebP. Maks ${MAX_KYC_FILE_SIZE_MB}MB`}
        />
        {file && (
          <p className="text-sm text-muted-foreground">File terpilih: <span className="font-medium">{file.name}</span></p>
        )}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onBack} data-testid="button-kyc-upload-back">Kembali</Button>
          <Button className="flex-1" disabled={!file} onClick={onNext} data-testid="button-kyc-upload-next">Lanjutkan</Button>
        </div>
      </CardContent>
    </Card>
  )
}
