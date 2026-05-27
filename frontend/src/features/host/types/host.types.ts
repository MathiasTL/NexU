export interface DashboardStats {
  totalBookings: number
  totalRevenue: number
  averageRating: number
  averageTicket: number
}

export interface CreatePropertyDraft {
  type: string
  location: string
  district: string
  address: string
  capacity: number
  bedrooms: number
  beds: number
  bathrooms: number
  amenities: string[]
  title: string
  description: string
  pricePerNight: number
}

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
