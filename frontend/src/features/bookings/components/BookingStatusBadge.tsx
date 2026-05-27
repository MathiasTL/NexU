import { cn } from '@/shared/utils/cn'
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/shared/utils/constants'
import type { BookingStatus } from '../types/booking.types'

interface BookingStatusBadgeProps {
  status: BookingStatus
}

export const BookingStatusBadge = ({ status }: BookingStatusBadgeProps) => (
  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', BOOKING_STATUS_COLORS[status])}>
    {BOOKING_STATUS_LABELS[status]}
  </span>
)
