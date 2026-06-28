import { apiRequest } from '@/core/http/client'
import type { Booking, CreateBookingPayload } from '../types/booking.types'

export const bookingService = {
  getByTenantId: async (tenantId: number): Promise<Booking[]> => {
    return apiRequest<Booking[]>(`/bookings?tenantId=${tenantId}`)
  },

  getByHostId: async (hostId: number): Promise<Booking[]> => {
    return apiRequest<Booking[]>(`/bookings?hostId=${hostId}`)
  },

  create: async (payload: CreateBookingPayload): Promise<Booking> => {
    return apiRequest<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  updateStatus: async (id: number, status: Booking['status']): Promise<void> => {
    return apiRequest<void>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
}
