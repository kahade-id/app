"use client"

import { useRouter } from "next/navigation"
import { Shield, CreditCard, Key, User, CaretRight, Buildings, Info, ClockCounterClockwise } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { LoadingState, ErrorState, PageHeader, StatusBadge, PageTransition } from "@/components/shared"
import { ProfileForm } from "@/components/app/profile/ProfileForm"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { useMe, useUpdateProfile } from "@/lib/hooks/use-user"
import { useKycStatus } from "@/lib/hooks/use-kyc"
import { formatDate } from "@/lib/date"
import { ROUTES, KYC_STATUS_LABELS } from "@/lib/constants"

export default function ProfilPage() {
  usePageTitle("Profil")
  const router = useRouter()
  const { data: user, isLoading, isError, refetch } = useMe()
  const { data: kyc } = useKycStatus()
  const updateProfile = useUpdateProfile()

  if (isLoading) return <LoadingState fullPage text="Memuat profil..." />
  if (isError || !user) return <ErrorState title="Gagal Memuat Profil" onRetry={() => refetch()} />

  const handleSave = (data: { fullName: string; bio?: string }) => {
    updateProfile.mutate(
      { fullName: data.fullName, bio: data.bio }
    )
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Profil" description="Kelola informasi akun Anda" />

        <Tabs defaultValue="info">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-max justify-start gap-1 border-b bg-transparent p-0 sm:w-auto">
              <TabsTrigger value="info" className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
                <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
                  <User className="size-3.5" />
                </div>
                <span className="ml-2">Info</span>
              </TabsTrigger>
              <TabsTrigger value="kyc" className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
                <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
                  <Shield className="size-3.5" />
                </div>
                <span className="ml-2">KYC</span>
              </TabsTrigger>
              <TabsTrigger value="keamanan" className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
                <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
                  <Key className="size-3.5" />
                </div>
                <span className="ml-2">Keamanan</span>
              </TabsTrigger>
              <TabsTrigger value="rekening" className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
                <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
                  <CreditCard className="size-3.5" />
                </div>
                <span className="ml-2 hidden sm:inline">Rekening Bank</span>
                <span className="ml-2 sm:hidden">Rekening</span>
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="info" className="mt-6 space-y-5">
            <ProfileForm user={user} onSave={handleSave} isPending={updateProfile.isPending} />
          </TabsContent>

          <TabsContent value="kyc" className="mt-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted">
                    <Shield className="size-4 text-foreground/70" />
                  </div>
                  Status KYC
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <StatusBadge status={user.kycStatus} label={KYC_STATUS_LABELS[user.kycStatus]} />
                </div>
                <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {user.kycStatus === "APPROVED" && (
                        <p>Identitas Anda telah terverifikasi. Anda dapat menggunakan semua fitur tanpa batasan.</p>
                      )}
                      {user.kycStatus === "PENDING" && (
                        <p>Dokumen Anda sedang direview oleh tim kami. Proses ini memakan waktu 1-3 hari kerja.</p>
                      )}
                      {user.kycStatus === "UNVERIFIED" && (
                        <p>Verifikasi identitas untuk membuka fitur lengkap seperti penarikan dana dan batas transaksi lebih tinggi.</p>
                      )}
                      {user.kycStatus === "REJECTED" && (
                        <p>Dokumen verifikasi Anda ditolak. Silakan ajukan ulang dengan dokumen yang valid.</p>
                      )}
                      {user.kycStatus === "REVOKED" && (
                        <p>Verifikasi Anda telah dicabut. Silakan hubungi tim support untuk informasi lebih lanjut.</p>
                      )}
                    </div>
                  </div>
                  {kyc?.submittedAt && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ClockCounterClockwise className="size-3.5" />
                      Terakhir diajukan: {formatDate(kyc.submittedAt)}
                    </p>
                  )}
                </div>
                {user.kycStatus === "UNVERIFIED" && (
                  <Button onClick={() => router.push(ROUTES.PROFILE_KYC)} data-testid="button-start-kyc">
                    <Shield className="mr-2 size-4" />
                    Mulai Verifikasi KYC
                  </Button>
                )}
                {user.kycStatus === "REJECTED" && (
                  <Button variant="outline" onClick={() => router.push(ROUTES.PROFILE_KYC)} data-testid="button-reapply-kyc">Ajukan Ulang KYC</Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keamanan" className="mt-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted">
                    <Key className="size-4 text-foreground/70" />
                  </div>
                  Keamanan Akun
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Kelola password dan autentikasi dua faktor.</p>
                <Button onClick={() => router.push(ROUTES.PROFILE_SECURITY)} data-testid="button-go-security">
                  <Key className="mr-2 size-4" />
                  Pengaturan Keamanan
                  <CaretRight className="ml-2 size-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rekening" className="mt-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted">
                    <Buildings className="size-4 text-foreground/70" />
                  </div>
                  Rekening Bank
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Kelola rekening bank untuk penarikan dana.</p>
                <Button onClick={() => router.push(ROUTES.PROFILE_BANK)} data-testid="button-go-bank">
                  <CreditCard className="mr-2 size-4" />
                  Kelola Rekening Bank
                  <CaretRight className="ml-2 size-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  )
}
