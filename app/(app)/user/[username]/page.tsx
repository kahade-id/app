"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Star, CalendarBlank, Package } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingState, ErrorState, EmptyState, PageHeader, UserAvatar, StatusBadge, PageTransition } from "@/components/shared"
import { useUserProfile, useUserRatings } from "@/lib/hooks/use-user"
import { formatDate, formatRelative } from "@/lib/date"
import { KYC_STATUS_LABELS, MEMBERSHIP_RANK_LABELS } from "@/lib/constants"

export default function PublicUserProfilePage() {
  const { username } = useParams<{ username: string }>()
  const router = useRouter()

  const { data: profile, isLoading, isError, refetch } = useUserProfile(username)
  const { data: ratingsData, isLoading: ratingsLoading } = useUserRatings(username)

  if (isLoading) return <LoadingState fullPage text="Memuat profil..." />
  if (isError || !profile) return <ErrorState title="Gagal Memuat Profil" onRetry={() => refetch()} />

  const ratings = ratingsData?.ratings ?? []

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Kembali" className="shrink-0 rounded-xl border border-border bg-muted hover:bg-muted/80" onClick={() => router.back()} data-testid="button-user-profile-back">
          <ArrowLeft className="size-4" />
        </Button>
        <PageHeader title={profile.fullName} description={`@${profile.username ?? username}`} />
      </div>

      <Card className="py-0">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="shrink-0">
              <UserAvatar src={profile.avatarUrl} name={profile.fullName} size="lg" />
            </div>
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">{profile.fullName}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">@{profile.username ?? username}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <StatusBadge status={profile.kycStatus} label={KYC_STATUS_LABELS[profile.kycStatus]} />
                <StatusBadge status="default" label={profile.accountType} variant="info" />
                <StatusBadge status="default" label={MEMBERSHIP_RANK_LABELS[profile.membershipRank] || profile.membershipRank} variant="default" />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-sm">
                  <Star className="size-4 text-amber-500" />
                  <span className="font-semibold">{(ratingsData?.averageRating ?? profile.averageRating)?.toFixed(1) ?? "0.0"}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground">
                  <Package className="size-4" />
                  <span>{profile.totalOrdersCompleted} transaksi</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground">
                  <CalendarBlank className="size-4" />
                  <span>Sejak {formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader>
          <CardTitle>Ulasan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {ratingsLoading ? (
            <LoadingState text="Memuat ulasan..." />
          ) : Array.isArray(ratings) && ratings.length > 0 ? (
            <div className="space-y-0">
              {ratings.map((rating) => (
                <div key={rating.id} className="flex gap-4 border-b border-border py-4 last:border-0 first:pt-0 last:pb-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
                    <Star className="size-5 text-amber-500" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {([0, 1, 2, 3, 4] as const).map((i) => (
                          <Star
                            key={i}
                            weight={i < rating.stars ? "fill" : "regular"}
                            className={`size-3.5 ${i < rating.stars ? "text-amber-500" : "text-muted-foreground/30"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {rating.giverRole === "BUYER" ? "Pembeli" : "Penjual"}
                      </span>
                    </div>
                    {rating.comment && (
                      <p className="text-sm leading-relaxed">{rating.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{formatRelative(rating.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Belum Ada Ulasan" description="Pengguna ini belum memiliki ulasan." />
          )}
        </CardContent>
      </Card>
    </PageTransition>
  )
}
