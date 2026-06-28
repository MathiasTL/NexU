import { apiRequest } from '@/core/http/client'
import type { DashboardStats } from '../types/host.types'
import type { Booking } from '@/features/bookings/types/booking.types'

export const hostService = {
  getDashboardStats: async (hostId: number): Promise<DashboardStats> => {
    return apiRequest<DashboardStats>(`/host/stats?hostId=${hostId}`)
  },

  getRecentActivity: async (hostId: number): Promise<Booking[]> => {
    return apiRequest<Booking[]>(`/host/activity?hostId=${hostId}`)
  },
}
