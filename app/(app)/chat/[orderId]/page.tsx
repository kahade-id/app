"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, PaperPlaneTilt, ArrowDown } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingState, ErrorState, EmptyState, PageHeader, PageTransition } from "@/components/shared"
import { useChatMessages, useSendMessage } from "@/lib/hooks/use-chat"
import { useAuthStore } from "@/lib/stores/auth.store"
import { formatDateTime } from "@/lib/date"
import { cn, sanitizeUrl } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"
import type { ChatMessage } from "@/types/chat"

export default function ChatPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [message, setMessage] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = React.useState(false)

  const { data, isLoading, isError, refetch } = useChatMessages(orderId)
  const sendMessage = useSendMessage(orderId)

  const messages: ChatMessage[] = data?.messages ?? []

  const scrollToBottom = React.useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  const handleScroll = React.useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100)
    }
  }, [])

  // Track whether this is the initial load
  const initialLoadRef = React.useRef(true)

  React.useEffect(() => {
    if (!scrollRef.current) return
    // #031 FIX: On initial load always scroll to bottom (show newest messages).
    // Previously only scrolled if already near bottom, causing users to see oldest
    // messages first. Subsequent updates still respect the isNearBottom heuristic.
    if (initialLoadRef.current) {
      scrollToBottom()
      initialLoadRef.current = false
      return
    }
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    if (isNearBottom) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  const handleSend = () => {
    if (!message.trim()) return
    sendMessage.mutate(
      { content: message.trim() },
      { onSuccess: () => setMessage("") }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isLoading) return <LoadingState fullPage text="Memuat chat..." />
  if (isError) return <ErrorState title="Gagal Memuat Chat" onRetry={() => refetch()} />

  return (
    <PageTransition className="flex h-[calc(100vh-12rem)] flex-col space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Kembali" className="shrink-0 rounded-xl border border-border bg-muted hover:bg-muted/80" onClick={() => { if (window.history.length > 1) { router.back() } else { router.push(ROUTES.TRANSACTIONS) } }} data-testid="button-chat-back">
          <ArrowLeft className="size-4" />
        </Button>
        <PageHeader title="Chat" description={`Order: ${orderId}`} />
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden py-0">
        <CardContent className="flex flex-1 flex-col p-0">
          <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto p-4" ref={scrollRef} onScroll={handleScroll}>
            {messages.length === 0 ? (
              <EmptyState
                title="Belum Ada Pesan"
                description="Mulai percakapan dengan pihak lawan transaksi."
              />
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  // #006 FIX: Use userId (USR-XXXXXXXX) consistently for senderId comparison.
                  // AuthUser has both `id` (UUID) and `userId` (USR-xxx).
                  // Backend stores senderId as userId format, so we use that directly.
                  const isMe = msg.senderId === user?.userId
                  const isSystem = msg.messageType === "SYSTEM"

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center">
                        <p className="rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground">{msg.content}</p>
                      </div>
                    )
                  }

                  return (
                    <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-3",
                        isMe ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-muted/50"
                      )}>
                        {!isMe && <p className="mb-1 text-xs font-semibold">{msg.sender?.fullName || "Pengguna"}</p>}
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        {msg.attachments?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.attachments.map((att) => (
                              <a key={att.id} href={sanitizeUrl(att.fileUrl)} target="_blank" rel="noopener noreferrer nofollow" className="block text-xs underline">
                                {att.fileName}
                              </a>
                            ))}
                          </div>
                        )}
                        <p className={cn("mt-1.5 text-[11px]", isMe ? "text-primary-foreground/60" : "text-muted-foreground")}>
                          {formatDateTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          {showScrollButton && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-3 right-3 z-10 size-9 rounded-full shadow-md"
              onClick={scrollToBottom}
              aria-label="Gulir ke bawah"
              data-testid="button-chat-scroll-bottom"
            >
              <ArrowDown className="size-4" />
            </Button>
          )}
          </div>

          <div className="flex items-center gap-3 border-t border-border bg-muted/30 p-4">
            {/* #046 FIX: Removed permanently-disabled attachment button */}
            {/* #045 FIX: Added aria-label for screen reader accessibility */}
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              aria-label="Tulis pesan"
              className="flex-1 bg-background"
              data-testid="input-chat-message"
            />
            <Button size="icon" className="shrink-0" onClick={handleSend} disabled={!message.trim() || sendMessage.isPending} data-testid="button-chat-send">
              <PaperPlaneTilt className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
