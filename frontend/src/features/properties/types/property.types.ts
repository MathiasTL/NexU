export type RoomType = 'room' | 'apartment' | 'shared' | 'studio'
export type AvailabilityStatus = 'available' | 'reserved' | 'unavailable'

export interface Property {
  id: number
  hostId: number
  title: string
  description: string
  shortDescription: string
  roomType: RoomType
  pricePerMonth: number
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
  availabilityStatus: AvailabilityStatus
  verifiedHost: boolean
  nearestUniversity: string
  distanceToUniversityMinutes: number
  createdAt: string
}

export interface PropertySearchFilters {
  district?: string
  roomType?: RoomType
  nearestUniversity?: string
  minPricePerMonth?: number
  maxPricePerMonth?: number
  minPrice?: number
  maxPrice?: number
  capacity?: number
  amenities?: string[]
  query?: string
  // filtros de convivencia (mapeados desde AdvancedFilters)
  petsAllowed?: boolean      // true → propiedad debe tener PETS_ALLOWED en amenities
  quietHours?: boolean       // true → propiedad debe tener QUIET_HOURS en amenities
  hasWorkspace?: boolean     // true → propiedad debe tener WORKSPACE en amenities
}

export interface BookingDraft {
  startMonth: string      // 'YYYY-MM'
  durationMonths: number
  residentCount: number
}
