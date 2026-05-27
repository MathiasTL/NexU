import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { propertyService } from '../services/property.service'
import { bookingService } from '@/features/bookings/services/booking.service'
import { useAuth } from '@/core/auth/useAuth'
import { PropertyGallery } from '../components/PropertyGallery'
import { PropertyBasicInfo } from '../components/PropertyBasicInfo'
import { PropertyAmenities } from '../components/PropertyAmenities'
import { PropertyHouseRules } from '../components/PropertyHouseRules'
import { PropertyReviews } from '../components/PropertyReviews'
import { PropertyBookingCard } from '../components/PropertyBookingCard'
import { PropertyHostInfo } from '../components/PropertyHostInfo'
import { CheckoutModal } from '../components/CheckoutModal'
import { SuccessModal } from '../components/SuccessModal'
import { Spinner } from '@/shared/components/ui/Spinner'
import { calcNights } from '@/shared/utils/formatters'
import type { Property } from '../types/property.types'
import type { BookingDraft } from '../types/property.types'

export const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState<BookingDraft | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [confirmedTotal, setConfirmedTotal] = useState(0)

  useEffect(() => {
    if (!id) return
    propertyService.getById(Number(id)).then(p => {
      setProperty(p)
      setLoading(false)
      if (!p) navigate('/404')
    })
  }, [id, navigate])

  const handleBook = (d: BookingDraft) => {
    setDraft(d)
    setCheckoutOpen(true)
  }

  const handleConfirm = async (message: string) => {
    if (!property || !draft || !user) return
    setBookingLoading(true)
    const nights = calcNights(draft.checkinDate, draft.checkoutDate)
    const subtotal = nights * property.pricePerNight
    const serviceFee = Math.round(subtotal * 0.14)
    const total = subtotal + serviceFee
    await bookingService.create({
      propertyId: property.id,
      tenantId: user.id,
      hostId: property.hostId,
      checkinDate: draft.checkinDate,
      checkoutDate: draft.checkoutDate,
      guestCount: draft.guestCount,
      nightCount: nights,
      pricePerNight: property.pricePerNight,
      serviceFee,
      totalAmount: total,
      currency: 'PEN',
      guestMessage: message || undefined,
    })
    setConfirmedTotal(total)
    setBookingLoading(false)
    setCheckoutOpen(false)
    setSuccessOpen(true)
  }

  if (loading) return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Spinner />
    </div>
  )

  if (!property) return null

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PropertyGallery images={property.images} title={property.title} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8">
          <PropertyBasicInfo property={property} />
          <hr className="border-gray-100" />
          <PropertyHostInfo hostId={property.hostId} />
          <hr className="border-gray-100" />
          <PropertyAmenities amenities={property.amenities} />
          <hr className="border-gray-100" />
          <PropertyHouseRules property={property} />
          <hr className="border-gray-100" />
          <PropertyReviews propertyId={property.id} />
        </div>
        <div>
          <PropertyBookingCard property={property} onBook={handleBook} />
        </div>
      </div>

      {draft && (
        <CheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          property={property}
          draft={draft}
          onConfirm={handleConfirm}
          loading={bookingLoading}
        />
      )}

      <SuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        propertyTitle={property.title}
        totalAmount={confirmedTotal}
        checkinDate={draft?.checkinDate ?? ''}
        checkoutDate={draft?.checkoutDate ?? ''}
      />
    </div>
  )
}
