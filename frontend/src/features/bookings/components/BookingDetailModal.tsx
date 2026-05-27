import { Calendar, Users, MessageSquare } from 'lucide-react'
import { Modal } from '@/shared/components/ui/Modal'
import { BookingStatusBadge } from './BookingStatusBadge'
import { formatDate, formatCurrency, formatNights } from '@/shared/utils/formatters'
import { PROPERTIES_MOCK } from '@/mock/properties.mock'
import type { Booking } from '../types/booking.types'

interface BookingDetailModalProps {
  booking: Booking | null
  open: boolean
  onClose: () => void
}

export const BookingDetailModal = ({ booking, open, onClose }: BookingDetailModalProps) => {
  if (!booking) return null
  const property = PROPERTIES_MOCK.find(p => p.id === booking.propertyId)

  return (
    <Modal open={open} onClose={onClose} title="Detalle de reserva" size="md">
      <div className="flex flex-col gap-4">
        {property && (
          <div className="flex gap-3">
            <img src={property.images[0]} alt={property.title} className="h-16 w-20 rounded-xl object-cover" />
            <div>
              <p className="font-semibold text-gray-900">{property.title}</p>
              <p className="text-sm text-gray-500">{property.district}, {property.city}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Estado:</span>
          <BookingStatusBadge status={booking.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3 text-sm">
          <div>
            <p className="text-xs text-gray-400">Check-in</p>
            <p className="font-medium text-gray-900">{formatDate(booking.checkinDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Check-out</p>
            <p className="font-medium text-gray-900">{formatDate(booking.checkoutDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Huéspedes</p>
            <p className="font-medium text-gray-900 flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {booking.guestCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Duración</p>
            <p className="font-medium text-gray-900 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formatNights(booking.nightCount)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>{formatCurrency(booking.pricePerNight)} × {formatNights(booking.nightCount)}</span>
            <span>{formatCurrency(booking.pricePerNight * booking.nightCount)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tarifa de servicio</span>
            <span>{formatCurrency(booking.serviceFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(booking.totalAmount)}</span>
          </div>
        </div>

        {booking.guestMessage && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-gray-500">
              <MessageSquare className="h-3.5 w-3.5" /> Mensaje del huésped
            </p>
            <p className="text-sm text-gray-700">{booking.guestMessage}</p>
          </div>
        )}

        {booking.hostNote && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
            <p className="mb-1 text-xs font-semibold text-blue-700">Nota del anfitrión</p>
            <p className="text-sm text-blue-900">{booking.hostNote}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
