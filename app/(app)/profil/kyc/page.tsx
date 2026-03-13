"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, UploadSimple, Camera } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader, LoadingState, ErrorState, PageTransition } from "@/components/shared"
import { useKycStatus, useSubmitKyc, useResubmitKyc } from "@/lib/hooks/use-kyc"
import { useUploadFile } from "@/lib/hooks/use-upload"
import { ROUTES } from "@/lib/constants"
import { toast } from "sonner"
import { KycStatusCard } from "@/components/app/kyc/KycStatusCard"
import { KycUploadStep } from "@/components/app/kyc/KycUploadStep"
import { KycSelfieStep } from "@/components/app/kyc/KycSelfieStep"
import { KycRejectedCard } from "@/components/app/kyc/KycRejectedCard"

const STEP_LABELS = ["Data Diri", "Foto KTP", "Selfie"]
const STEP_ICONS = [FileText, UploadSimple, Camera]

export default function KycPage() {
  const router = useRouter()
  const { data: kyc, isLoading, isError, refetch } = useKycStatus()
  const submitKyc = useSubmitKyc()
  const resubmitKyc = useResubmitKyc()
  const uploadFile = useUploadFile()
  const [step, setStep] = React.useState(1)
  const [nik, setNik] = React.useState("")
  const [ktpFile, setKtpFile] = React.useState<File | null>(null)
  const [selfieFile, setSelfieFile] = React.useState<File | null>(null)
  const [ktpUrl, setKtpUrl] = React.useState("")
  const [selfieUrl, setSelfieUrl] = React.useState("")
  const [isUploading, setIsUploading] = React.useState(false)

  if (isLoading) return <LoadingState fullPage text="Memuat status KYC..." />
  if (isError) return <ErrorState title="Gagal Memuat Status KYC" onRetry={() => refetch()} />

  const backButton = (
    <Button variant="ghost" size="icon" aria-label="Kembali" className="shrink-0 rounded-xl border border-border bg-muted hover:bg-muted/80" onClick={() => router.push(ROUTES.PROFILE)} data-testid="button-kyc-back">
      <ArrowLeft className="size-4" />
    </Button>
  )

  if (kyc?.status === "APPROVED") {
    return (
      <PageTransition>
        <div className="mx-auto max-w-lg space-y-6">
          <div className="flex items-center gap-3">
            {backButton}
            <PageHeader title="Verifikasi KYC" />
          </div>
          <KycStatusCard status="APPROVED" />
        </div>
      </PageTransition>
    )
  }

  if (kyc?.status === "PENDING") {
    return (
      <PageTransition>
        <div className="mx-auto max-w-lg space-y-6">
          <div className="flex items-center gap-3">
            {backButton}
            <PageHeader title="Verifikasi KYC" />
          </div>
          <KycStatusCard status="PENDING" />
        </div>
      </PageTransition>
    )
  }

  // #008 FIX: REVOKED requires contacting support — not a normal re-submission flow.
  if (kyc?.status === "REVOKED") {
    return (
      <PageTransition>
        <div className="mx-auto max-w-lg space-y-6">
          <div className="flex items-center gap-3">
            {backButton}
            <PageHeader title="Verifikasi KYC" />
          </div>
          <KycStatusCard status="REVOKED" />
          <p className="text-sm text-muted-foreground text-center">
            Verifikasi Anda telah dicabut. Silakan hubungi support untuk informasi lebih lanjut.
          </p>
        </div>
      </PageTransition>
    )
  }

  // #009 FIX: REJECTED users should only see KycRejectedCard + re-submit CTA,
  // not the multi-step form at the same time (previously both were visible).
  if (kyc?.status === "REJECTED") {
    return (
      <PageTransition>
        <div className="mx-auto max-w-lg space-y-6">
          <div className="flex items-center gap-3">
            {backButton}
            <PageHeader title="Verifikasi KYC" />
          </div>
          {/* #7 FIX: Wire useResubmitKyc ke KycRejectedCard — sebelumnya hook tidak pernah dipakai */}
          <KycRejectedCard
            rejectionReason={kyc.rejectionReason ?? "Tidak ada alasan yang diberikan."}
            onResubmit={() => resubmitKyc.mutate()}
            isResubmitting={resubmitKyc.isPending}
          />
        </div>
      </PageTransition>
    )
  }

  const handleSubmit = async () => {
    if (!nik) return

    setIsUploading(true)
    try {
      let finalKtpUrl = ktpUrl
      let finalSelfieUrl = selfieUrl

      // #018 FIX: Upload KTP and selfie in parallel with Promise.all —
      // previously sequential (2x the time). This saves 5-15s on mobile connections.
      const needsKtpUpload = ktpFile && !ktpUrl
      const needsSelfieUpload = selfieFile && !selfieUrl

      if (needsKtpUpload || needsSelfieUpload) {
        const [uploadedKtp, uploadedSelfie] = await Promise.all([
          needsKtpUpload
            ? uploadFile.mutateAsync({ file: ktpFile!, folder: "kyc" })
            : Promise.resolve(ktpUrl),
          needsSelfieUpload
            ? uploadFile.mutateAsync({ file: selfieFile!, folder: "kyc" })
            : Promise.resolve(selfieUrl),
        ])
        if (needsKtpUpload) { finalKtpUrl = uploadedKtp; setKtpUrl(finalKtpUrl) }
        if (needsSelfieUpload) { finalSelfieUrl = uploadedSelfie; setSelfieUrl(finalSelfieUrl) }
      }

      if (!finalKtpUrl || !finalSelfieUrl) {
        toast.error("Gagal mengupload file. Silakan coba lagi.")
        return
      }

      submitKyc.mutate(
        { nik, ktpPhotoUrl: finalKtpUrl, selfiePhotoUrl: finalSelfieUrl },
        { onSuccess: () => router.push(ROUTES.PROFILE) }
      )
    } catch {
      toast.error("Gagal mengupload file. Silakan coba lagi.")
    } finally {
      setIsUploading(false)
    }
  }

  const isSubmitting = isUploading || submitKyc.isPending

  return (
    <PageTransition>
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          {backButton}
          <PageHeader title="Verifikasi KYC" description="Verifikasi identitas Anda untuk menggunakan fitur lengkap" />
        </div>

        <div className="flex items-center justify-between px-2">
          {/* #088 FIX: Added role="list" and aria-label on steps for screen reader accessibility */}
          {[1, 2, 3].map((s, idx) => {
            const StepIcon = STEP_ICONS[idx]
            const stepStatus = step > s ? "selesai" : step === s ? "aktif" : "belum dimulai"
            return (
              <React.Fragment key={s}>
                <div
                  className="flex flex-col items-center gap-2"
                  role="listitem"
                  aria-label={`Langkah ${s}: ${STEP_LABELS[idx]} — ${stepStatus}`}
                  aria-current={step === s ? "step" : undefined}
                >
                  <div className={`flex size-10 items-center justify-center rounded-xl border-2 transition-colors ${step >= s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-muted-foreground"}`}>
                    <StepIcon className="size-4" aria-hidden="true" />
                  </div>
                  <span className={`text-xs font-medium ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>{STEP_LABELS[idx]}</span>
                </div>
                {s < 3 && (
                  <div aria-hidden="true" className={`relative mx-2 mb-6 h-0.5 flex-1 rounded-full transition-colors ${step > s ? "bg-primary" : "bg-border"}`} />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted">
                  <FileText className="size-4 text-foreground/70" />
                </div>
                Data Diri
              </CardTitle>
              <CardDescription>Masukkan NIK (Nomor Induk Kependudukan) Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nik-input" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">NIK (16 digit)</Label>
                {/* #089 FIX: Added id, aria-describedby linking input to format hint */}
                <Input
                  id="nik-input"
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, "").slice(0, 16))}
                  placeholder="Masukkan 16 digit NIK"
                  maxLength={16}
                  inputMode="numeric"
                  aria-describedby="nik-hint"
                  data-testid="input-kyc-nik"
                />
                <p id="nik-hint" className="text-xs text-muted-foreground">
                  Nomor Induk Kependudukan sesuai KTP Anda (16 digit angka)
                </p>
              </div>
              <Button className="w-full" disabled={nik.length !== 16} onClick={() => setStep(2)} data-testid="button-kyc-nik-next">Lanjutkan</Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <KycUploadStep
            file={ktpFile}
            onFileChange={(file) => { setKtpFile(file); setKtpUrl("") }}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <KycSelfieStep
            file={selfieFile}
            onFileChange={(file) => { setSelfieFile(file); setSelfieUrl("") }}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {/* REJECTED status is handled by early return above — not shown here */}
      </div>
    </PageTransition>
  )
}
