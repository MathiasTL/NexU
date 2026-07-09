import { useState } from 'react'
import { CreditCard, ShieldCheck, BadgeCheck, Lock, AlertTriangle } from 'lucide-react'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { formatCurrency, formatMonths, formatYearMonth } from '@/shared/utils/formatters'
import type { Property, BookingDraft } from '../types/property.types'

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
  property: Property
  draft: BookingDraft
  onConfirm: (message: string) => void
  loading: boolean
  error?: string | null
}

const formatCard = (value: string) =>
  value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

export const CheckoutModal = ({ open, onClose, property, draft, onConfirm, loading, error }: CheckoutModalProps) => {
  const [cardNumber, setCardNumber] = useState('')
  const [cardName,   setCardName]   = useState('')
  const [expiry,     setExpiry]     = useState('')
  const [cvv,        setCvv]        = useState('')
  const [message,    setMessage]    = useState('')

  const subtotal   = property.pricePerMonth * draft.durationMonths
  const serviceFee = Math.round(subtotal * 0.14)
  const total      = subtotal + serviceFee

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(message)
  }

  return (
    <Modal open={open} onClose={onClose} title="Confirmar reserva" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Tranquilidad antes de pedir la tarjeta: es una solicitud, no un cargo */}
        <div className="flex items-start gap-2.5 rounded-xl bg-secondary-50 p-3 dark:bg-secondary/10">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-secondary-600 dark:text-secondary-300" />
          <div className="text-sm">
            <p className="font-medium text-secondary-700 dark:text-secondary-200">
              No se te cobrará hasta que el propietario confirme
            </p>
            <p className="mt-0.5 text-secondary-600 dark:text-secondary-300/80">
              Estás enviando una solicitud de reserva. Podrás coordinar los detalles antes de cualquier pago.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/50">
          <p className="font-medium text-gray-900 dark:text-white">{property.title}</p>
          {property.verifiedHost && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-secondary-600 dark:text-secondary-300">
              <BadgeCheck className="h-3.5 w-3.5" /> Propietario verificado por NexU
            </p>
          )}
          <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-300">
            Inicio: {formatYearMonth(draft.startMonth)} · {formatMonths(draft.durationMonths)} · {draft.residentCount}{' '}
            {draft.residentCount === 1 ? 'residente' : 'residentes'}
          </p>
          <div className="mt-2 flex flex-col gap-1 text-sm">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>{formatCurrency(property.pricePerMonth)} × {formatMonths(draft.durationMonths)}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Tarifa de servicio (14%)</span>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cubre el soporte de NexU y la gestión segura del pago.
            </p>
            <div className="mt-1 flex justify-between border-t border-gray-200 pt-1.5 font-bold text-gray-900 dark:border-gray-600 dark:text-white">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <CreditCard className="h-4 w-4" /> Información de pago
          </h3>
          <div className="flex flex-col gap-3">
            <Input
              label="Número de tarjeta"
              value={cardNumber}
              onChange={e => setCardNumber(formatCard(e.target.value))}
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
              autoComplete="cc-number"
              required
            />
            <Input
              label="Nombre en la tarjeta"
              value={cardName}
              onChange={e => setCardName(e.target.value)}
              placeholder="MARÍA GONZÁLEZ"
              autoComplete="cc-name"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Vencimiento"
                value={expiry}
                onChange={e => setExpiry(e.target.value)}
                placeholder="MM/AA"
                inputMode="numeric"
                autoComplete="cc-exp"
                maxLength={5}
                required
              />
              <Input
                label="CVV"
                value={cvv}
                onChange={e => setCvv(e.target.value)}
                placeholder="123"
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={4}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="checkout-message" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Mensaje para el propietario (opcional)
          </label>
          <textarea
            id="checkout-message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500"
            rows={2}
            placeholder="Cuéntale algo al propietario sobre ti..."
          />
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? 'Enviando solicitud…' : `Enviar solicitud por ${formatCurrency(total)}`}
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-gray-500 dark:text-gray-400">
          <Lock className="h-3 w-3 shrink-0" />
          Pago simulado — no se realizan cargos reales ni se guardan tus datos.
        </p>
      </form>
    </Modal>
  )
}
