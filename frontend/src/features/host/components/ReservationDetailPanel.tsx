import { X, Calendar, Users, MessageSquare } from 'lucide-react'
import { BookingStatusBadge } from '@/features/bookings/components/BookingStatusBadge'
import { Button } from '@/shared/components/ui/Button'
import { formatDate, formatCurrency, formatNights } from '@/shared/utils/formatters'
import { PROPERTIES_MOCK } from '@/mock/properties.mock'
import { USERS_MOCK } from '@/mock/users.mock'
import type { Booking } from '@/features/bookings/types/booking.types'

interface ReservationDetailPanelProps {
  booking: Booking | null
  onClose: () => void
  onUpdateStatus: (id: number, status: Booking['status']) => void
}

export const ReservationDetailPanel = ({ booking, onClose, onUpdateStatus }: ReservationDetailPanelProps) => {
  if (!booking) return null

  const property = PROPERTIES_MOCK.find(p => p.id === booking.propertyId)
  const tenant = USERS_MOCK.find(u => u.id === booking.tenantId)

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Detalle de reserva #{booking.id}</h3>
        <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>
      </div>

      {property && (
        <div className="mb-4 flex gap-3">
          <img src={property.images[0]} alt={property.title} className="h-16 w-20 rounded-xl object-cover" />
          <div>
            <p className="font-medium text-gray-900 text-sm">{property.title}</p>
            <p className="text-xs text-gray-500">{property.district}</p>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-gray-500">Estado:</span>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3 text-sm">
        <div>
          <p className="text-xs text-gray-400">Check-in</p>
          <p className="font-medium text-gray-900 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {formatDate(booking.checkinDate)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Check-out</p>
          <p className="font-medium text-gray-900">{formatDate(booking.checkoutDate)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Huéspedes</p>
          <p className="font-medium text-gray-900 flex items-center gap-1">
            <Users className="h-3 w-3" /> {booking.guestCount}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Duración</p>
          <p className="font-medium text-gray-900">{formatNights(booking.nightCount)}</p>
        </div>
      </div>

      {tenant && (
        <div className="mb-4">
          <p className="mb-1 text-xs font-semibold text-gray-500">Huésped</p>
          <p className="text-sm font-medium text-gray-900">{tenant.firstName} {tenant.lastName}</p>
          <p className="text-xs text-gray-500">{tenant.email}</p>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-1 text-sm">
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
        <div className="mb-4 rounded-xl bg-gray-50 p-3">
          <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-gray-500">
            <MessageSquare className="h-3 w-3" /> Mensaje del huésped
          </p>
          <p className="text-sm text-gray-700">{booking.guestMessage}</p>
        </div>
      )}

      {booking.status === 'pending' && (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onUpdateStatus(booking.id, 'confirmed')}
          >
            Confirmar
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={() => onUpdateStatus(booking.id, 'cancelled')}
          >
            Rechazar
          </Button>
        </div>
      )}

      {booking.status === 'confirmed' && (
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => onUpdateStatus(booking.id, 'completed')}
        >
          Marcar como completada
        </Button>
      )}
    </div>
  )
}
