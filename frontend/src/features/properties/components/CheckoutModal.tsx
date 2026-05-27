import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { formatCurrency, formatNights } from '@/shared/utils/formatters'
import type { Property } from '../types/property.types'
import type { BookingDraft } from '../types/property.types'
import { calcNights } from '@/shared/utils/formatters'

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
  property: Property
  draft: BookingDraft
  onConfirm: (message: string) => void
  loading: boolean
}

const formatCard = (value: string) =>
  value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

export const CheckoutModal = ({ open, onClose, property, draft, onConfirm, loading }: CheckoutModalProps) => {
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [message, setMessage] = useState('')

  const nights = calcNights(draft.checkinDate, draft.checkoutDate)
  const subtotal = nights * property.pricePerNight
  const serviceFee = Math.round(subtotal * 0.14)
  const total = subtotal + serviceFee

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(message)
  }

  return (
    <Modal open={open} onClose={onClose} title="Confirmar reserva" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
          <p className="font-medium text-gray-900">{property.title}</p>
          <p className="mt-1 text-sm text-gray-500">
            {draft.checkinDate} → {draft.checkoutDate} · {formatNights(nights)} · {draft.guestCount} {draft.guestCount === 1 ? 'huésped' : 'huéspedes'}
          </p>
          <div className="mt-2 flex flex-col gap-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{formatCurrency(property.pricePerNight)} × {formatNights(nights)}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tarifa de servicio (14%)</span>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
            <CreditCard className="h-4 w-4" /> Información de pago
          </h3>
          <div className="flex flex-col gap-3">
            <Input
              label="Número de tarjeta"
              value={cardNumber}
              onChange={e => setCardNumber(formatCard(e.target.value))}
              placeholder="1234 5678 9012 3456"
              required
            />
            <Input
              label="Nombre en la tarjeta"
              value={cardName}
              onChange={e => setCardName(e.target.value)}
              placeholder="MARÍA GONZÁLEZ"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Vencimiento"
                value={expiry}
                onChange={e => setExpiry(e.target.value)}
                placeholder="MM/AA"
                maxLength={5}
                required
              />
              <Input
                label="CVV"
                value={cvv}
                onChange={e => setCvv(e.target.value)}
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Mensaje para el anfitrión (opcional)
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            rows={2}
            placeholder="Cuéntale algo al anfitrión..."
          />
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Confirmar y pagar {formatCurrency(total)}
        </Button>
        <p className="text-center text-xs text-gray-400">Simulación de pago — no se realizarán cargos reales</p>
      </form>
    </Modal>
  )
}
