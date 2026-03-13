import { create } from 'zustand'
import type { ChatMessage } from '@/types/chat'

interface ChatState {
  messages: Record<string, ChatMessage[]>
  activeRoomId: string | null
  // L-7 NOTE: isConnected is always false — setConnected() exists but is never called
  // because WebSocket is not yet implemented (polling is used instead, see use-chat.ts).
  // Do NOT use isConnected to gate UI — it will always show "disconnected".
  // This field will become meaningful when WebSocket is implemented (GitHub issue #223).
  isConnected: boolean
  typingUsers: Record<string, string[]>
  setMessages: (orderId: string, messages: ChatMessage[]) => void
  addMessage: (orderId: string, message: ChatMessage) => void
  setActiveRoom: (roomId: string | null) => void
  setConnected: (connected: boolean) => void
  setTypingUsers: (orderId: string, userIds: string[]) => void
  clearMessages: (orderId: string) => void
  clearAll: () => void
}

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: {},
  activeRoomId: null,
  isConnected: false,
  typingUsers: {},

  setMessages: (orderId, messages) =>
    set({
      messages: { ...get().messages, [orderId]: messages },
    }),

  addMessage: (orderId, message) => {
    const existing = get().messages[orderId] || []
    const alreadyExists = existing.some((m) => m.id === message.id)
    if (alreadyExists) return

    set({
      messages: {
        ...get().messages,
        [orderId]: [...existing, message],
      },
    })
  },

  setActiveRoom: (roomId) =>
    set({ activeRoomId: roomId }),

  setConnected: (connected) =>
    set({ isConnected: connected }),

  setTypingUsers: (orderId, userIds) =>
    set({
      typingUsers: { ...get().typingUsers, [orderId]: userIds },
    }),

  clearMessages: (orderId) => {
    const messages = { ...get().messages }
    delete messages[orderId]
    set({ messages })
  },

  clearAll: () =>
    set({ messages: {}, activeRoomId: null, typingUsers: {} }),
}))
