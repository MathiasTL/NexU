import { apiRequest } from '@/core/http/client'
import type { Review } from '../types/review.types'

export const reviewService = {
  getByPropertyId: async (propertyId: number): Promise<Review[]> => {
    return apiRequest<Review[]>(`/properties/${propertyId}/reviews`)
  },

  getByHostId: async (_hostId: number, propertyIds: number[]): Promise<Review[]> => {
    if (!propertyIds.length) return []
    return apiRequest<Review[]>(`/reviews?propertyIds=${propertyIds.join(',')}`)
  },

  getAverageRating: (reviews: Review[]): number => {
    if (!reviews.length) return 0
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  },
}
