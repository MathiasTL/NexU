import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
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
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { formatCurrency } from '@/shared/utils/formatters'
import type { Property, BookingDraft } from '../types/property.types'

export const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [property,       setProperty]       = useState<Property | null>(null)
  const [loading,        setLoading]        = useState(true)
  const [draft,          setDraft]          = useState<BookingDraft | null>(null)
  const [checkoutOpen,   setCheckoutOpen]   = useState(false)
  const [mobileBookOpen, setMobileBookOpen] = useState(false)
  const [successOpen,    setSuccessOpen]    = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError,   setBookingError]   = useState<string | null>(null)
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
    setBookingError(null)
    setMobileBookOpen(false)
    setCheckoutOpen(true)
  }

  const handleConfirm = async (message: string) => {
    if (!property || !draft || !user) return
    setBookingLoading(true)
    setBookingError(null)
    const subtotal   = property.pricePerMonth * draft.durationMonths
    const serviceFee = Math.round(subtotal * 0.14)
    const total      = subtotal + serviceFee
    try {
      await bookingService.create({
        propertyId:    property.id,
        tenantId:      user.id,
        hostId:        property.hostId,
        startMonth:    draft.startMonth,
        durationMonths: draft.durationMonths,
        residentCount: draft.residentCount,
        pricePerMonth: property.pricePerMonth,
        serviceFee,
        totalAmount:   total,
        currency:      'PEN',
        guestMessage:  message || undefined,
      })
      setConfirmedTotal(total)
      setCheckoutOpen(false)
      setSuccessOpen(true)
    } catch {
      setBookingError('No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo; no se realizó ningún cargo.')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Spinner />
    </div>
  )

  if (!property) return null

  const isUnavailable = property.availabilityStatus === 'unavailable'

  return (
    <div className="mx-auto max-w-7xl pb-28 lg:px-4 lg:py-6 lg:pb-8">

      {/* Galería — full-bleed en móvil, con botón flotante */}
      <div className="relative">
        <PropertyGallery images={property.images} title={property.title} />
        <button
          onClick={() => navigate(-1)}
          className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm backdrop-blur-sm transition hover:bg-white dark:bg-gray-900/80 dark:text-white dark:hover:bg-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
      </div>

      {/* Contenido */}
      <div className="px-4 lg:px-0">
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <PropertyBasicInfo property={property} />
            <hr className="border-gray-100 dark:border-gray-800" />
            <PropertyHostInfo hostId={property.hostId} />
            <hr className="border-gray-100 dark:border-gray-800" />
            <PropertyAmenities amenities={property.amenities} />
            <hr className="border-gray-100 dark:border-gray-800" />
            <PropertyHouseRules property={property} />
            <hr className="border-gray-100 dark:border-gray-800" />
            <PropertyReviews propertyId={property.id} />
          </div>
          <div className="hidden lg:block">
            <PropertyBookingCard property={property} onBook={handleBook} />
          </div>
        </div>
      </div>

      {/* Footer sticky — solo móvil */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t border-gray-200 bg-white px-5 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:border-gray-700 dark:bg-gray-900 lg:hidden">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">por mes</p>
          <span className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(property.pricePerMonth)}</span>
        </div>
        <Button onClick={() => setMobileBookOpen(true)} disabled={isUnavailable}>
          {isUnavailable ? 'No disponible' : 'Reservar ahora'}
        </Button>
      </div>

      {/* Selección de reserva en móvil — el usuario elige inicio, duración y residentes */}
      <Modal open={mobileBookOpen} onClose={() => setMobileBookOpen(false)} title="Elige tu reserva" size="md">
        <PropertyBookingCard property={property} onBook={handleBook} bare />
      </Modal>

      {draft && (
        <CheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          property={property}
          draft={draft}
          onConfirm={handleConfirm}
          loading={bookingLoading}
          error={bookingError}
        />
      )}

      <SuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        propertyTitle={property.title}
        totalAmount={confirmedTotal}
        startMonth={draft?.startMonth ?? ''}
        durationMonths={draft?.durationMonths ?? 1}
      />
    </div>
  )
}
