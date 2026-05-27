import { USERS_MOCK } from '@/mock/users.mock'
import { NOTIFICATIONS_MOCK } from '@/mock/notifications.mock'
import { MESSAGES_MOCK } from '@/mock/messages.mock'
import type { ProfileUpdatePayload } from '../types/account.types'

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms))

export const accountService = {
  updateProfile: async (userId: number, data: ProfileUpdatePayload) => {
    await delay()
    const user = USERS_MOCK.find(u => u.id === userId)
    if (user) Object.assign(user, data)
    return user
  },

  getNotifications: async (userId: number) => {
    await delay()
    return NOTIFICATIONS_MOCK.filter(n => n.userId === userId)
  },

  markNotificationRead: async (id: number) => {
    await delay()
    const notif = NOTIFICATIONS_MOCK.find(n => n.id === id)
    if (notif) notif.read = true
  },

  getConversations: async (userId: number) => {
    await delay()
    return MESSAGES_MOCK.filter(c => c.participants.includes(userId))
  },

  sendMessage: async (conversationId: number, senderId: number, text: string) => {
    await delay()
    const conv = MESSAGES_MOCK.find(c => c.id === conversationId)
    if (!conv) return
    const newMsg = {
      id: conv.messages.length + 1,
      senderId,
      text,
      createdAt: new Date().toISOString(),
    }
    conv.messages.push(newMsg)
    conv.lastMessageAt = newMsg.createdAt
    return newMsg
  },
}
