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

export interface PropertySearchFilters {
  district?: string
  minPrice?: number
  maxPrice?: number
  capacity?: number
  amenities?: string[]
  query?: string
}

export interface BookingDraft {
  checkinDate: string
  checkoutDate: string
  guestCount: number
}
