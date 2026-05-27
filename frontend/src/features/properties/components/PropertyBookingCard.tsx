import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/core/auth/useAuth'
import { Button } from '@/shared/components/ui/Button'
import { formatCurrency, calcNights, formatNights } from '@/shared/utils/formatters'
import type { Property } from '../types/property.types'
import type { BookingDraft } from '../types/property.types'

interface PropertyBookingCardProps {
  property: Property
  onBook: (draft: BookingDraft) => void
}

const today = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

export const PropertyBookingCard = ({ property, onBook }: PropertyBookingCardProps) => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [checkin, setCheckin] = useState(today)
  const [checkout, setCheckout] = useState(tomorrow)
  const [guests, setGuests] = useState(1)

  const nights = calcNights(checkin, checkout)
  const subtotal = nights * property.pricePerNight
  const serviceFee = Math.round(subtotal * 0.14)
  const total = subtotal + serviceFee

  const handleReserve = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (nights < 1) return
    onBook({ checkinDate: checkin, checkoutDate: checkout, guestCount: guests })
  }

  return (
    <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
      <div className="mb-4 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{formatCurrency(property.pricePerNight)}</span>
        <span className="text-gray-500">/ noche</span>
      </div>

      <div className="mb-3 overflow-hidden rounded-xl border border-gray-200">
        <div className="grid grid-cols-2">
          <div className="border-r border-gray-200 p-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Llegada</label>
            <input
              type="date"
              value={checkin}
              min={today}
              onChange={e => setCheckin(e.target.value)}
              className="w-full text-sm font-medium text-gray-900 outline-none"
            />
          </div>
          <div className="p-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Salida</label>
            <input
              type="date"
              value={checkout}
              min={checkin}
              onChange={e => setCheckout(e.target.value)}
              className="w-full text-sm font-medium text-gray-900 outline-none"
            />
          </div>
        </div>
        <div className="border-t border-gray-200 p-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Huéspedes</label>
          <select
            value={guests}
            onChange={e => setGuests(Number(e.target.value))}
            className="w-full text-sm font-medium text-gray-900 outline-none"
          >
            {Array.from({ length: property.capacity }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'huésped' : 'huéspedes'}</option>
            ))}
          </select>
        </div>
      </div>

      <Button onClick={handleReserve} size="lg" className="w-full">
        {isAuthenticated ? 'Reservar' : 'Iniciar sesión para reservar'}
      </Button>

      {nights > 0 && (
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>{formatCurrency(property.pricePerNight)} × {formatNights(nights)}</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tarifa de servicio</span>
            <span>{formatCurrency(serviceFee)}</span>
          </div>
          <hr className="border-gray-100" />
          <div className="flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
