import { apiRequest } from '@/core/http/client'
import type { AmenityCategory } from '@/mock/amenities.mock'

let _cache: AmenityCategory[] | null = null

export const amenityService = {
  getCategories: async (): Promise<AmenityCategory[]> => {
    if (_cache) return _cache
    _cache = await apiRequest<AmenityCategory[]>('/amenities')
    return _cache
  },
}
