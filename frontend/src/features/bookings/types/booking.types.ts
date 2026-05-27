export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Booking {
  id: number
  propertyId: number
  tenantId: number
  hostId: number
  checkinDate: string
  checkoutDate: string
  guestCount: number
  nightCount: number
  pricePerNight: number
  serviceFee: number
  totalAmount: number
  currency: 'PEN'
  status: BookingStatus
  guestMessage: string | null
  hostNote: string | null
  createdAt: string
}

export interface CreateBookingPayload {
  propertyId: number
  tenantId: number
  hostId: number
  checkinDate: string
  checkoutDate: string
  guestCount: number
  nightCount: number
  pricePerNight: number
  serviceFee: number
  totalAmount: number
  currency: 'PEN'
  guestMessage?: string
}
