import { REVIEWS_MOCK } from '@/mock/reviews.mock'
import type { Review } from '../types/review.types'

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms))

export const reviewService = {
  getByPropertyId: async (propertyId: number): Promise<Review[]> => {
    await delay()
    return REVIEWS_MOCK.filter(r => r.propertyId === propertyId)
  },

  getByHostId: async (_hostId: number, propertyIds: number[]): Promise<Review[]> => {
    await delay()
    return REVIEWS_MOCK.filter(r => propertyIds.includes(r.propertyId))
  },

  getAverageRating: (reviews: Review[]): number => {
    if (!reviews.length) return 0
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  },
}
