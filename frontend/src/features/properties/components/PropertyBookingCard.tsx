import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '@/core/auth/useAuth'
import { Button } from '@/shared/components/ui/Button'
import { formatCurrency, formatMonths, formatYearMonth } from '@/shared/utils/formatters'
import type { Property, BookingDraft } from '../types/property.types'

interface PropertyBookingCardProps {
  property: Property
  onBook: (draft: BookingDraft) => void
  /** Sin marco propio (sticky/borde/sombra) para incrustarla dentro de un modal. */
  bare?: boolean
}

const DURATION_OPTIONS = [1, 2, 3, 6, 12]

const nextMonths = Array.from({ length: 6 }, (_, i) => {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + i)
  return d.toISOString().slice(0, 7)
})

export const PropertyBookingCard = ({ property, onBook, bare = false }: PropertyBookingCardProps) => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [startMonth,     setStartMonth]     = useState(nextMonths[0])
  const [durationMonths, setDurationMonths] = useState(1)
  const [residents,      setResidents]      = useState(1)

  const subtotal   = property.pricePerMonth * durationMonths
  const serviceFee = Math.round(subtotal * 0.14)
  const total      = subtotal + serviceFee

  const isUnavailable = property.availabilityStatus === 'unavailable'
  const isReserved    = property.availabilityStatus === 'reserved'

  const handleReserve = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (isUnavailable) return
    onBook({ startMonth, durationMonths, residentCount: residents })
  }

  return (
    <div className={bare
      ? ''
      : 'sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800'}>
      {/* Monthly price */}
      <div className="mb-4 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(property.pricePerMonth)}</span>
        <span className="text-gray-500 dark:text-gray-400">/ mes</span>
      </div>

      {/* Availability warning */}
      {(isUnavailable || isReserved) && (
        <div className={`mb-4 flex items-start gap-2 rounded-xl border p-3 text-sm ${
          isUnavailable ? 'border-red-100 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400'
                       : 'border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400'
        }`}>
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {isUnavailable
              ? 'Este espacio no está disponible actualmente.'
              : 'Este espacio está reservado. Consulta al propietario para confirmación.'}
          </span>
        </div>
      )}

      {/* Booking form */}
      <div className="mb-3 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-2">
          <div className="border-r border-gray-200 p-2 dark:border-gray-600">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Inicio</label>
            <select
              value={startMonth}
              onChange={e => setStartMonth(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none dark:text-white"
            >
              {nextMonths.map(m => (
                <option key={m} value={m}>{formatYearMonth(m)}</option>
              ))}
            </select>
          </div>
          <div className="p-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Duración</label>
            <select
              value={durationMonths}
              onChange={e => setDurationMonths(Number(e.target.value))}
              className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none dark:text-white"
            >
              {DURATION_OPTIONS.map(n => (
                <option key={n} value={n}>{formatMonths(n)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="border-t border-gray-200 p-2 dark:border-gray-600">
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Residentes</label>
          <select
            value={residents}
            onChange={e => setResidents(Number(e.target.value))}
            className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none dark:text-white"
          >
            {Array.from({ length: property.capacity }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'residente' : 'residentes'}</option>
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

      <div className="mt-4 flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>{formatCurrency(property.pricePerMonth)} × {formatMonths(durationMonths)}</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Tarifa de servicio</span>
          <span>{formatCurrency(serviceFee)}</span>
        </div>
        <hr className="border-gray-100 dark:border-gray-700" />
        <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
          <span>Total estimado</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}
