import { api } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api'
import type { ChatMessage, ChatRoom } from '@/types/chat'

// M-04 FIX: ChatRoom is now the single canonical definition from @/types/chat.
// Previously this file re-declared ChatRoom with a different shape, causing type mismatches.
// Re-export for backward compatibility with any consumers importing from this file.
export type { ChatRoom }

export interface ChatAttachment {
  id: string
  messageId: string
  fileUrl: string
  fileType: string
  fileName: string
  createdAt: string
}

export const chatService = {
  getRooms(params?: PaginationParams) {
    return api.get<PaginatedResponse<ChatRoom>>(API.CHAT_ROOMS, { params })
  },

  getRoomMessages(roomId: string, params?: { cursor?: string; limit?: number }) {
    return api.get<ApiResponse<{ messages: ChatMessage[]; nextCursor: string | null; hasMore: boolean }>>(API.CHAT_ROOM_MESSAGES(roomId), { params })
  },

  sendRoomMessage(roomId: string, data: { content: string; messageType?: string }) {
    return api.post<ApiResponse<ChatMessage>>(API.CHAT_ROOM_SEND(roomId), data)
  },

  markRoomRead(roomId: string) {
    return api.post<ApiResponse<null>>(API.CHAT_ROOM_READ(roomId))
  },

  deleteRoomMessage(roomId: string, messageId: string) {
    return api.delete<ApiResponse<null>>(API.CHAT_ROOM_DELETE_MESSAGE(roomId, messageId))
  },

  getRoomAttachments(roomId: string, params?: PaginationParams) {
    return api.get<PaginatedResponse<ChatAttachment>>(API.CHAT_ROOM_ATTACHMENTS(roomId), { params })
  },

  getMessages(orderId: string, params?: { cursor?: string; limit?: number }) {
    return api.get<ApiResponse<{ messages: ChatMessage[]; nextCursor: string | null; hasMore: boolean }>>(API.CHAT_MESSAGES(orderId), { params })
  },

  sendMessage(orderId: string, data: { content: string; messageType?: string }) {
    return api.post<ApiResponse<ChatMessage>>(API.CHAT_SEND(orderId), data)
  },

  getPresignedUrl(orderId: string, data: { fileName: string; fileType: string }) {
    return api.post<ApiResponse<{ uploadUrl: string; fileUrl: string; fileKey: string }>>(
      API.CHAT_PRESIGNED_URL(orderId),
      data
    )
  },
}
