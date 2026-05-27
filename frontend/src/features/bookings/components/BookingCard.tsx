import { Link } from 'react-router-dom'
import { Calendar, Users } from 'lucide-react'
import { BookingStatusBadge } from './BookingStatusBadge'
import { formatDate, formatCurrency, formatNights } from '@/shared/utils/formatters'
import { PROPERTIES_MOCK } from '@/mock/properties.mock'
import type { Booking } from '../types/booking.types'

interface BookingCardProps {
  booking: Booking
  onSelect?: (booking: Booking) => void
}

export const BookingCard = ({ booking, onSelect }: BookingCardProps) => {
  const property = PROPERTIES_MOCK.find(p => p.id === booking.propertyId)

  return (
    <div
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md cursor-pointer"
      onClick={() => onSelect?.(booking)}
    >
      <div className="flex gap-4 p-4">
        {property && (
          <img
            src={property.images[0]}
            alt={property.title}
            className="h-20 w-24 shrink-0 rounded-xl object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-start justify-between gap-2">
            <Link
              to={`/properties/${booking.propertyId}`}
              onClick={e => e.stopPropagation()}
              className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-1"
            >
              {property?.title ?? `Propiedad #${booking.propertyId}`}
            </Link>
            <BookingStatusBadge status={booking.status} />
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(booking.checkinDate)} → {formatDate(booking.checkoutDate)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {booking.guestCount} huéspedes
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">{formatNights(booking.nightCount)}</span>
            <span className="font-semibold text-gray-900">{formatCurrency(booking.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
