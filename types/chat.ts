export type ChatMessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'

export interface ChatAttachment {
  id: string
  messageId: string
  fileName: string
  fileSize: number
  mimeType: string
  fileUrl: string
  thumbnailUrl: string | null
  createdAt: string
}

export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  sender: {
    id: string
    username: string | null
    fullName: string
    avatarUrl: string | null
  }
  messageType: ChatMessageType
  content: string | null
  isEdited: boolean
  isDeleted: boolean
  readAt: string | null
  createdAt: string
  attachments: ChatAttachment[]
}

// M-04 FIX: Single canonical ChatRoom definition.
// Previously duplicated between types/chat.ts (shape A) and lib/services/chat.service.ts
// (shape B with different fields). This caused type mismatches when consuming
// chat room data across the codebase. Service now imports this type.
export interface ChatRoom {
  id: string
  orderId: string
  orderTitle: string
  participants: {
    userId: string
    username: string
    fullName: string
    avatarUrl: string | null
  }[]
  lastMessage: ChatMessage | null
  unreadCount: number
  isArchived: boolean
  createdAt: string
  updatedAt: string
  // messages array is only present in order-chat detail responses, not room list
  messages?: ChatMessage[]
}
