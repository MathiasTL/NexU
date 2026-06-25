import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '@/core/auth/useAuth'
import { Button } from '@/shared/components/ui/Button'
import { formatCurrency, calcNights, formatNights } from '@/shared/utils/formatters'
import type { Property } from '../types/property.types'
import type { BookingDraft } from '../types/property.types'

interface PropertyBookingCardProps {
  property: Property
  onBook: (draft: BookingDraft) => void
}

const today    = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

export const PropertyBookingCard = ({ property, onBook }: PropertyBookingCardProps) => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [checkin,  setCheckin]  = useState(today)
  const [checkout, setCheckout] = useState(tomorrow)
  const [persons,  setPersons]  = useState(1)

  const nights    = calcNights(checkin, checkout)
  const subtotal  = nights * property.pricePerNight
  const serviceFee = Math.round(subtotal * 0.14)
  const total     = subtotal + serviceFee

  const isUnavailable = property.availabilityStatus === 'unavailable'
  const isReserved    = property.availabilityStatus === 'reserved'

  const handleReserve = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (nights < 1 || isUnavailable) return
    onBook({ checkinDate: checkin, checkoutDate: checkout, guestCount: persons })
  }

  return (
    <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
      {/* Monthly price (primary) */}
      <div className="mb-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{formatCurrency(property.pricePerMonth)}</span>
        <span className="text-gray-500">/ mes</span>
      </div>
      <p className="mb-4 text-xs text-gray-400">
        {formatCurrency(property.pricePerNight)}/noche para estadías cortas
      </p>

      {/* Availability warning */}
      {(isUnavailable || isReserved) && (
        <div className={`mb-4 flex items-start gap-2 rounded-xl border p-3 text-sm ${
          isUnavailable ? 'border-red-100 bg-red-50 text-red-700' : 'border-amber-100 bg-amber-50 text-amber-700'
        }`}>
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {isUnavailable
              ? 'Este espacio no está disponible actualmente.'
              : 'Este espacio está reservado. Consulta al propietario para confirmación.'}
          </span>
        </div>
      )}

      {/* Date + person picker */}
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
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Personas</label>
          <select
            value={persons}
            onChange={e => setPersons(Number(e.target.value))}
            className="w-full text-sm font-medium text-gray-900 outline-none"
          >
            {Array.from({ length: property.capacity }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
            ))}
          </select>
        </div>
      </div>

      <Button onClick={handleReserve} size="lg" className="w-full" disabled={isUnavailable}>
        {isUnavailable
          ? 'No disponible'
          : isAuthenticated
            ? 'Reservar espacio'
            : 'Iniciar sesión para reservar'}
      </Button>

      {nights > 0 && !isUnavailable && (
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
