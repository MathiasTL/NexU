import { Calendar } from 'lucide-react'
import { BookingStatusBadge } from '@/features/bookings/components/BookingStatusBadge'
import { formatDate, formatCurrency } from '@/shared/utils/formatters'
import { PROPERTIES_MOCK } from '@/mock/properties.mock'
import type { Booking } from '@/features/bookings/types/booking.types'

interface ActivityFeedProps {
  bookings: Booking[]
}

export const ActivityFeed = ({ bookings }: ActivityFeedProps) => (
  <div>
    <h3 className="mb-4 font-semibold text-gray-900">Actividad reciente</h3>
    {bookings.length === 0 ? (
      <p className="text-sm text-gray-500">No hay actividad reciente.</p>
    ) : (
      <div className="flex flex-col gap-3">
        {bookings.map(booking => {
          const property = PROPERTIES_MOCK.find(p => p.id === booking.propertyId)
          return (
            <div key={booking.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-3">
              <div className="flex items-start gap-3">
                {property && (
                  <img src={property.images[0]} alt={property.title} className="h-12 w-14 rounded-lg object-cover" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{property?.title ?? `Propiedad #${booking.propertyId}`}</p>
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {formatDate(booking.checkinDate)} → {formatDate(booking.checkoutDate)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <BookingStatusBadge status={booking.status} />
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>
          )
        })}
      </div>
    )}
  </div>
)
