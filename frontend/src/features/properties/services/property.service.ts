import { PROPERTIES_MOCK } from '@/mock/properties.mock'
import type { Property, PropertySearchFilters } from '../types/property.types'

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms))

export const propertyService = {
  getAll: async (): Promise<Property[]> => {
    await delay()
    return PROPERTIES_MOCK.filter(p => p.status === 'active')
  },

  getById: async (id: number): Promise<Property | null> => {
    await delay()
    return PROPERTIES_MOCK.find(p => p.id === id) ?? null
  },

  getByHostId: async (hostId: number): Promise<Property[]> => {
    await delay()
    return PROPERTIES_MOCK.filter(p => p.hostId === hostId)
  },

  search: async (filters: PropertySearchFilters): Promise<Property[]> => {
    await delay()
    return PROPERTIES_MOCK.filter(p => {
      if (p.status !== 'active') return false
      if (filters.query) {
        const q = filters.query.toUpperCase()
        const matchesUniversity = p.nearUniversity?.toUpperCase() === q
        const matchesTitle = p.title.toLowerCase().includes(filters.query.toLowerCase())
        const matchesDistrict = p.district.toLowerCase().includes(filters.query.toLowerCase())
        if (!matchesUniversity && !matchesTitle && !matchesDistrict) return false
      }
      if (filters.nearUniversity && p.nearUniversity?.toUpperCase() !== filters.nearUniversity.toUpperCase()) return false
      if (filters.district && !p.district.toLowerCase().includes(filters.district.toLowerCase())) return false
      if (filters.maxPrice && p.pricePerNight > filters.maxPrice) return false
      if (filters.minPrice && p.pricePerNight < filters.minPrice) return false
      if (filters.capacity && p.capacity < filters.capacity) return false
      if (filters.amenities?.length) {
        const hasAll = filters.amenities.every(a => p.amenities.includes(a))
        if (!hasAll) return false
      }
      return true
    })
  },

  create: async (data: Partial<Property> & { hostId: number }): Promise<Property> => {
    await delay(800)
    const newProp: Property = {
      id: PROPERTIES_MOCK.length + 1,
      hostId: data.hostId,
      title: data.title ?? 'Nueva propiedad',
      description: data.description ?? '',
      shortDescription: data.shortDescription ?? '',
      pricePerNight: data.pricePerNight ?? 100,
      currency: 'PEN',
      location: data.location ?? '',
      district: data.district ?? '',
      city: 'Lima',
      country: 'Perú',
      lat: data.lat ?? -12.0464,
      lng: data.lng ?? -77.0428,
      images: data.images ?? [],
      amenities: data.amenities ?? [],
      capacity: data.capacity ?? 2,
      bedrooms: data.bedrooms ?? 1,
      beds: data.beds ?? 1,
      bathrooms: data.bathrooms ?? 1,
      rating: 0,
      reviewsCount: 0,
      checkinTime: '15:00',
      checkoutTime: '11:00',
      houseRules: [],
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    }
    PROPERTIES_MOCK.push(newProp)
    return newProp
  },
}
