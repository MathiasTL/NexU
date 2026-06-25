export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Booking {
  id: number
  propertyId: number
  tenantId: number
  hostId: number
  startMonth: string         // 'YYYY-MM'
  durationMonths: number
  residentCount: number
  pricePerMonth: number
  serviceFee: number         // 14% de (pricePerMonth × durationMonths)
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
  startMonth: string
  durationMonths: number
  residentCount: number
  pricePerMonth: number
  serviceFee: number
  totalAmount: number
  currency: 'PEN'
  guestMessage?: string
}
