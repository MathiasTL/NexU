import { Calendar, Users, MessageSquare } from 'lucide-react'
import { Modal } from '@/shared/components/ui/Modal'
import { BookingStatusBadge } from './BookingStatusBadge'
import { formatCurrency, formatMonths, formatYearMonth } from '@/shared/utils/formatters'
import type { Booking } from '../types/booking.types'

interface BookingDetailModalProps {
  booking: Booking | null
  open: boolean
  onClose: () => void
}

export const BookingDetailModal = ({ booking, open, onClose }: BookingDetailModalProps) => {
  if (!booking) return null

  return (
    <Modal open={open} onClose={onClose} title="Detalle de reserva" size="md">
      <div className="flex flex-col gap-4">
        {(booking.propertyImage || booking.propertyTitle) && (
          <div className="flex gap-3">
            {booking.propertyImage && (
              <img src={booking.propertyImage} alt={booking.propertyTitle ?? ''} className="h-16 w-20 rounded-xl object-cover" />
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{booking.propertyTitle ?? `Propiedad #${booking.propertyId}`}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Estado:</span>
          <BookingStatusBadge status={booking.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3 text-sm dark:bg-gray-700/50">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Inicio</p>
            <p className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
              <Calendar className="h-3.5 w-3.5" /> {formatYearMonth(booking.startMonth)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Duración</p>
            <p className="font-medium text-gray-900 dark:text-white">{formatMonths(booking.durationMonths)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Residentes</p>
            <p className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
              <Users className="h-3.5 w-3.5" /> {booking.residentCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Precio mensual</p>
            <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(booking.pricePerMonth)}/mes</p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>{formatCurrency(booking.pricePerMonth)} × {formatMonths(booking.durationMonths)}</span>
            <span>{formatCurrency(booking.pricePerMonth * booking.durationMonths)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Tarifa de servicio</span>
            <span>{formatCurrency(booking.serviceFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 dark:text-white">
            <span>Total</span>
            <span>{formatCurrency(booking.totalAmount)}</span>
          </div>
        </div>

        {booking.guestMessage && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/50">
            <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <MessageSquare className="h-3.5 w-3.5" /> Mensaje del estudiante
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{booking.guestMessage}</p>
          </div>
        )}

        {booking.hostNote && (
          <div className="rounded-xl border border-primary-100 bg-primary-50 p-3 dark:border-primary/20 dark:bg-primary/10">
            <p className="mb-1 text-xs font-semibold text-primary-600 dark:text-primary">Nota del propietario</p>
            <p className="text-sm text-secondary dark:text-secondary-300">{booking.hostNote}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
