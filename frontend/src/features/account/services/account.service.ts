import { apiRequest } from '@/core/http/client'
import type { AuthUser } from '@/features/auth/types/auth.types'
import type { ProfileUpdatePayload, PersonalInfoPayload, LifestylePreferences } from '../types/account.types'
import type { Notification } from '@/mock/notifications.mock'
import type { Conversation, Message } from '@/mock/messages.mock'

export const accountService = {
  updateProfile: async (userId: number, data: ProfileUpdatePayload): Promise<AuthUser> => {
    return apiRequest<AuthUser>(`/users/${userId}/profile`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  updatePersonalInfo: async (userId: number, data: PersonalInfoPayload): Promise<AuthUser> => {
    return apiRequest<AuthUser>(`/users/${userId}/personal-info`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  updatePreferences: async (userId: number, prefs: LifestylePreferences): Promise<AuthUser> => {
    return apiRequest<AuthUser>(`/users/${userId}/preferences`, {
      method: 'PATCH',
      body: JSON.stringify({ lifestylePreferences: prefs }),
    })
  },

  getNotifications: async (userId: number): Promise<Notification[]> => {
    return apiRequest<Notification[]>(`/users/${userId}/notifications`)
  },

  markNotificationRead: async (id: number): Promise<void> => {
    return apiRequest<void>(`/notifications/${id}/read`, { method: 'PATCH' })
  },

  getConversations: async (userId: number): Promise<Conversation[]> => {
    return apiRequest<Conversation[]>(`/users/${userId}/conversations`)
  },

  sendMessage: async (conversationId: number, senderId: number, text: string): Promise<Message> => {
    return apiRequest<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ senderId, text }),
    })
  },
}
