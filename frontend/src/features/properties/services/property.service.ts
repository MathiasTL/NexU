import { apiRequest, getAccessToken } from '@/core/http/client'
import type { Property, PropertySearchFilters } from '../types/property.types'

export const propertyService = {
  getAll: async (): Promise<Property[]> => {
    return apiRequest<Property[]>('/properties')
  },

  getById: async (id: number): Promise<Property | null> => {
    try {
      return await apiRequest<Property>(`/properties/${id}`)
    } catch {
      return null
    }
  },

  getByHostId: async (hostId: number): Promise<Property[]> => {
    return apiRequest<Property[]>(`/users/${hostId}/properties`)
  },

  search: async (filters: PropertySearchFilters): Promise<Property[]> => {
    const params = new URLSearchParams()
    if (filters.query)              params.set('query', filters.query)
    if (filters.district)           params.set('district', filters.district)
    if (filters.roomType)           params.set('roomType', filters.roomType)
    if (filters.nearestUniversity)  params.set('nearestUniversity', filters.nearestUniversity)
    if (filters.minPricePerMonth != null) params.set('minPricePerMonth', String(filters.minPricePerMonth))
    if (filters.maxPricePerMonth != null) params.set('maxPricePerMonth', String(filters.maxPricePerMonth))
    if (filters.minPrice != null)   params.set('minPrice', String(filters.minPrice))
    if (filters.maxPrice != null)   params.set('maxPrice', String(filters.maxPrice))
    if (filters.capacity != null)   params.set('capacity', String(filters.capacity))
    if (filters.amenities?.length)  params.set('amenities', filters.amenities.join(','))
    if (filters.petsAllowed === true)  params.set('petsAllowed', 'true')
    if (filters.quietHours === true)   params.set('quietHours', 'true')
    if (filters.hasWorkspace === true) params.set('hasWorkspace', 'true')
    const qs = params.toString()
    return apiRequest<Property[]>(`/properties/search${qs ? `?${qs}` : ''}`)
  },

  create: async (data: Partial<Property> & { hostId: number }): Promise<Property> => {
    return apiRequest<Property>('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  uploadImages: async (files: File[]): Promise<{ urls: string[] }> => {
    const token = getAccessToken()
    const form = new FormData()
    files.forEach(f => form.append('files', f))
    const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'
    const res = await fetch(`${BASE_URL}/properties/upload-images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
    return res.json() as Promise<{ urls: string[] }>
  },
}
