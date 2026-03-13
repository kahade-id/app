"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Chat } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { LoadingState, ErrorState, EmptyState, PageHeader, PageTransition, SearchInput } from "@/components/shared"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { useChatRooms } from "@/lib/hooks/use-chat"
import { formatRelative } from "@/lib/date"
import { ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { ChatRoom } from "@/lib/services/chat.service"

export default function ChatListPage() {
  usePageTitle("Chat")
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useChatRooms()
  const [search, setSearch] = useState("")

  const allRooms: ChatRoom[] = data?.data ?? []
  const rooms = allRooms.filter((room) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (room.orderTitle || "").toLowerCase().includes(q) ||
      room.orderId.toLowerCase().includes(q) ||
      (room.participants || []).some((p) => p.fullName.toLowerCase().includes(q))
    )
  })

  if (isLoading) return <LoadingState fullPage text="Memuat chat..." />
  if (isError) return <ErrorState title="Gagal Memuat Chat" onRetry={() => refetch()} />

  return (
    <PageTransition className="space-y-6">
      <PageHeader title="Chat" description="Percakapan dengan pihak transaksi" />

      {allRooms.length > 0 && (
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari chat berdasarkan order atau nama..."
          data-testid="input-chat-search"
        />
      )}

      {rooms.length === 0 ? (
        <EmptyState
          title="Belum Ada Chat"
          description="Anda belum memiliki percakapan."
          icon={<Chat className="size-8" />}
        />
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={cn(
                "flex items-center gap-4 rounded-lg border p-4 transition-colors cursor-pointer hover:bg-muted/50 hover:border-foreground/20",
                room.unreadCount > 0 && "border-l-4 border-l-primary"
              )}
              onClick={() => router.push(ROUTES.CHAT(room.orderId))}
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/10 text-primary font-semibold text-sm">
                {room.participants && room.participants.length > 0
                  ? room.participants[0].fullName.charAt(0).toUpperCase()
                  : <Chat className="size-5 text-foreground/70" />}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold">
                    {room.orderTitle || `Order: ${room.orderId}`}
                  </span>
                  {room.unreadCount > 0 && (
                    <Badge variant="default" className="shrink-0 text-xs">
                      {room.unreadCount}
                    </Badge>
                  )}
                </div>
                {room.lastMessage ? (
                  <p className="truncate text-sm text-muted-foreground">
                    {room.lastMessage.content || "Lampiran"}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Belum ada pesan
                  </p>
                )}
                {room.participants && room.participants.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {room.participants.map((p) => p.fullName).join(", ")}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {room.lastMessage
                  ? formatRelative(room.lastMessage.createdAt)
                  : formatRelative(room.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  )
}
