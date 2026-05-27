export interface Property {
  id: number
  hostId: number
  title: string
  description: string
  shortDescription: string
  pricePerNight: number
  currency: 'PEN'
  location: string
  district: string
  city: string
  country: string
  lat: number
  lng: number
  images: string[]
  amenities: string[]
  capacity: number
  bedrooms: number
  beds: number
  bathrooms: number
  rating: number
  reviewsCount: number
  checkinTime: string
  checkoutTime: string
  houseRules: string[]
  status: 'active' | 'inactive'
  createdAt: string
}

export type QuickFilter = 'individual' | 'shared' | 'roommates' | 'petFriendly'

export interface PropertySearchFilters {
  district?: string
  minPrice?: number
  maxPrice?: number
  capacity?: number
  amenities?: string[]
  query?: string
  bedrooms?: number
  bathrooms?: number
  quickFilter?: QuickFilter | null
}

export interface AdvancedFiltersValue {
  propertyType: string
  bedrooms: number | null
  bathrooms: number | null
  university: string
  travelMinutes: number | null
  sleepSchedule: '' | 'morning' | 'night'
  noiseLevel: '' | 'low' | 'medium' | 'high'
  petsAllowed: boolean | null
  cleaningLevel: '' | 'low' | 'medium' | 'high'
  studyHabits: '' | 'quiet' | 'mixed' | 'social'
  roommateCount: number | null
  maxPrice: number | null
  servicesIncluded: string[]
}

export const DEFAULT_ADVANCED_FILTERS: AdvancedFiltersValue = {
  propertyType: '',
  bedrooms: null,
  bathrooms: null,
  university: '',
  travelMinutes: null,
  sleepSchedule: '',
  noiseLevel: '',
  petsAllowed: null,
  cleaningLevel: '',
  studyHabits: '',
  roommateCount: null,
  maxPrice: null,
  servicesIncluded: [],
}

export interface BookingDraft {
  checkinDate: string
  checkoutDate: string
  guestCount: number
}
