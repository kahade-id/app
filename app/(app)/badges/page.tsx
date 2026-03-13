"use client"

import { Trophy, Medal } from "@phosphor-icons/react"
import { PageHeader, LoadingState, ErrorState, EmptyState, PageTransition } from "@/components/shared"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { useAllBadges, useMyBadges } from "@/lib/hooks/use-badge"
import { formatDate } from "@/lib/date"
import { cn } from "@/lib/utils"

export default function BadgesPage() {
  usePageTitle("Badges")
  const { data: allBadges, isLoading: loadingAll, isError: errorAll, refetch: refetchAll } = useAllBadges()
  const { data: myBadges, isLoading: loadingMy, isError: errorMy, refetch: refetchMy } = useMyBadges()

  const isLoading = loadingAll || loadingMy
  const isError = errorAll || errorMy

  const earnedBadgeIds = new Set(
    myBadges?.map((ub) => ub.badgeId) ?? []
  )

  const earnedMap = new Map(
    myBadges?.map((ub) => [ub.badgeId, ub] as const) ?? []
  )

  if (isLoading) return <LoadingState fullPage text="Memuat lencana..." />
  if (isError) return <ErrorState title="Gagal Memuat Lencana" onRetry={() => { refetchAll(); refetchMy() }} />

  const allBadgesList = allBadges ?? []
  const myBadgesList = myBadges ?? []

  return (
    <PageTransition className="space-y-6">
      <PageHeader title="Lencana" description="Koleksi lencana yang Anda peroleh" />

      <div className="space-y-4">
        <h2 className="text-base font-semibold">Badge Saya</h2>
        {myBadgesList.length === 0 ? (
          <EmptyState
            title="Belum Ada Lencana"
            description="Anda belum memperoleh lencana apapun. Selesaikan transaksi untuk mendapatkan lencana!"
            icon={<Medal className="size-8" />}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myBadgesList.map((ub) => (
              <Card key={ub.id} className="border-primary/20 py-0 transition-colors hover:border-primary/40">
                <CardContent className="flex items-start gap-4 p-4">
                  {ub.badge.iconUrl ? (
                    <img src={ub.badge.iconUrl} alt={ub.badge.name} width={48} height={48} className="size-12 rounded-xl border border-border object-contain p-1" />
                  ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                      <Trophy className="size-6 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{ub.badge.name}</p>
                      <Badge variant="default" className="shrink-0 text-xs">Diperoleh</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{ub.badge.description}</p>
                    <p className="text-xs text-muted-foreground">Diperoleh {formatDate(ub.earnedAt)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-semibold">Semua Badge</h2>
        {allBadgesList.length === 0 ? (
          <Card className="py-0">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/50">
                <Trophy className="size-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">Tidak Ada Lencana</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">Belum ada lencana yang tersedia.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allBadgesList.map((badge) => {
              const isEarned = earnedBadgeIds.has(badge.id)
              const userBadge = earnedMap.get(badge.id)
              return (
                <Card key={badge.id} className={cn("py-0 transition-colors", isEarned ? "border-primary/20 hover:border-primary/40" : "opacity-50 grayscale-[30%]")}>
                  <CardContent className="flex items-start gap-4 p-4">
                    {badge.iconUrl ? (
                      <img src={badge.iconUrl} alt={badge.name} width={48} height={48} className={cn("size-12 rounded-xl border border-border object-contain p-1", !isEarned && "grayscale")} />
                    ) : (
                      <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl border", isEarned ? "border-primary/20 bg-primary/10" : "border-border bg-muted")}>
                        <Trophy className={cn("size-6", isEarned ? "text-primary" : "text-muted-foreground")} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">{badge.name}</p>
                        {isEarned && <Badge variant="default" className="shrink-0 text-xs">Diperoleh</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
                      {isEarned && userBadge && (
                        <p className="text-xs text-muted-foreground">Diperoleh {formatDate(userBadge.earnedAt)}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
