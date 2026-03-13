import { create } from 'zustand'
import type { Notification } from '@/types/notification'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isOpen: boolean
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  setUnreadCount: (count: number) => void
  setOpen: (open: boolean) => void
  toggleOpen: () => void
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),

  addNotification: (notification) => {
    const existing = get().notifications
    const alreadyExists = existing.some((n) => n.id === notification.id)
    if (alreadyExists) return

    set({
      notifications: [notification, ...existing],
      unreadCount: get().unreadCount + (notification.isRead ? 0 : 1),
    })
  },

  markAsRead: (id) => {
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
    )
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    })
  },

  markAllAsRead: () => {
    const now = new Date().toISOString()
    const notifications = get().notifications.map((n) =>
      n.isRead ? n : { ...n, isRead: true, readAt: now }
    )
    set({ notifications, unreadCount: 0 })
  },

  removeNotification: (id) => {
    const notification = get().notifications.find((n) => n.id === id)
    const notifications = get().notifications.filter((n) => n.id !== id)
    set({
      notifications,
      // M-12 FIX: Use Math.max(0, ...) to prevent unreadCount from going negative.
      // Without the guard, rapid or duplicate removeNotification calls could decrement
      // below zero, causing the notification badge to show "-1" or similar.
      unreadCount: notification && !notification.isRead
        ? Math.max(0, get().unreadCount - 1)
        : get().unreadCount,
    })
  },

  setUnreadCount: (count) =>
    set({ unreadCount: count }),

  setOpen: (open) =>
    set({ isOpen: open }),

  toggleOpen: () =>
    set({ isOpen: !get().isOpen }),
}))
