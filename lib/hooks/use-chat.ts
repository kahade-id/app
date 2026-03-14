'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage, extractData } from '@/lib/api'
import { toast } from 'sonner'
import { chatService } from '@/lib/services/chat.service'
import { useAuthReady } from '@/lib/hooks/use-auth-ready'
import type { PaginationParams } from '@/types/api'

export function useChatRooms(params?: PaginationParams) {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['chat', 'rooms', params],
    queryFn: () => chatService.getRooms(params).then(extractData),
    enabled: authReady,
    // UX-002 FIX: refetchInterval must be a function (not a static value) so it
    // re-evaluates document.visibilityState on every interval tick.
    // A static value is evaluated once at mount — if the tab was hidden at mount,
    // polling would be permanently disabled for that session.
    refetchInterval: () =>
      typeof document !== 'undefined' && document.visibilityState === 'visible'
        ? 15000
        : false,
    refetchIntervalInBackground: false,
  })
}

// #14 NOTE: useChatRoomMessages vs useChatMessages — dua endpoint berbeda, bukan duplikat.
// - useChatRoomMessages(roomId): Mengambil pesan dari "Chat Room" (fitur chat umum antar user,
//   tidak terikat order). Endpoint: GET /chat/rooms/:roomId/messages
// - useChatMessages(orderId): Mengambil pesan dari "Order Chat" (chat yang terikat ke satu transaksi).
//   Endpoint: GET /chat/:orderId/messages
// Keduanya perlu dipertahankan — hapus jika ternyata backend hanya punya satu endpoint.
export function useChatRoomMessages(roomId: string, params?: { cursor?: string; limit?: number }) {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['chat', 'room', roomId, 'messages', params],
    queryFn: () => chatService.getRoomMessages(roomId, params).then(extractData),
    enabled: !!roomId && authReady,
    // UX-003 FIX: Add visibility check for polling (was always polling every 5s, even in background)
    refetchInterval: () =>
      typeof document !== 'undefined' && document.visibilityState === 'visible'
        ? 5000
        : false,
    refetchIntervalInBackground: false,
  })
}

export function useSendRoomMessage(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { content: string; messageType?: string }) =>
      chatService.sendRoomMessage(roomId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'room', roomId] })
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengirim pesan'))
    },
  })
}

export function useMarkRoomRead(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => chatService.markRoomRead(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] })
    },
  })
}

export function useDeleteRoomMessage(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: string) => chatService.deleteRoomMessage(roomId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'room', roomId] })
      toast.success('Pesan berhasil dihapus')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal menghapus pesan'))
    },
  })
}

export function useChatRoomAttachments(roomId: string, params?: PaginationParams) {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['chat', 'room', roomId, 'attachments', params],
    queryFn: () => chatService.getRoomAttachments(roomId, params).then(extractData),
    enabled: !!roomId && authReady,
  })
}

// TODO: cursor-based pagination via params.cursor — not yet implemented in UI
// L-4 NOTE: Chat currently uses HTTP polling instead of WebSocket.
// This causes high latency (3-30s message delay) and wastes bandwidth on inactive chats.
// Migration plan: implement Socket.IO or native WebSocket in a useChatSocket() hook,
// call setConnected(true) in chat.store when connected, and replace refetchInterval
// with socket event listeners. See GitHub issue #223 for the full migration spec.
// Until WebSocket is implemented, the current adaptive polling (3s active → 30s idle)
// is the best available approach.
export function useChatMessages(orderId: string, params?: { cursor?: string; limit?: number }) {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['chat', orderId, params],
    queryFn: () =>
      chatService.getMessages(orderId, params).then(extractData),
    enabled: !!orderId && authReady,
    refetchInterval: (query) => {
      // #092 FIX: Don't poll when the tab is in the background (already handled
      // by refetchIntervalInBackground: false, but also skip if page is hidden)
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return false
      }

      // #036 FIX: Corrected backoff logic — was inverted.
      // When data is fresh (< 30s stale): fast polling — likely an active conversation
      // When data is getting stale (< 2 min): moderate polling
      // When very stale (> 2 min): slow polling — conversation has gone quiet
      // Previously the logic was backwards: slow when fresh, fast when stale.
      const staleness = Date.now() - query.state.dataUpdatedAt
      if (staleness < 30_000) return 3_000   // Active: poll every 3s
      if (staleness < 120_000) return 10_000  // Moderate: poll every 10s
      return 30_000                           // Quiet: poll every 30s
    },
    refetchIntervalInBackground: false,
  })
}

export function useSendMessage(orderId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { content: string; messageType?: string }) =>
      chatService.sendMessage(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', orderId] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengirim pesan'))
    },
  })
}

export function useChatPresignedUrl(orderId: string) {
  return useMutation({
    mutationFn: (data: { fileName: string; fileType: string }) =>
      chatService.getPresignedUrl(orderId, data),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengupload file'))
    },
  })
}
