import { Link } from 'react-router-dom'
import { Calendar, Users } from 'lucide-react'
import { BookingStatusBadge } from './BookingStatusBadge'
import { formatCurrency, formatMonths, formatYearMonth } from '@/shared/utils/formatters'
import type { Booking } from '../types/booking.types'

interface BookingCardProps {
  booking: Booking
  onSelect?: (booking: Booking) => void
}

export const BookingCard = ({ booking, onSelect }: BookingCardProps) => {
  return (
    <div
      className="cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
      onClick={() => onSelect?.(booking)}
    >
      <div className="flex gap-4 p-4">
        {booking.propertyImage && (
          <img
            src={booking.propertyImage}
            alt={booking.propertyTitle ?? ''}
            className="h-20 w-24 shrink-0 rounded-xl object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <Link
              to={`/properties/${booking.propertyId}`}
              onClick={e => e.stopPropagation()}
              className="line-clamp-1 font-semibold text-gray-900 hover:text-primary dark:text-white dark:hover:text-primary"
            >
              {booking.propertyTitle ?? `Propiedad #${booking.propertyId}`}
            </Link>
            <BookingStatusBadge status={booking.status} />
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatYearMonth(booking.startMonth)} · {formatMonths(booking.durationMonths)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {booking.residentCount} {booking.residentCount === 1 ? 'residente' : 'residentes'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400 dark:text-gray-500">{formatMonths(booking.durationMonths)}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(booking.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
