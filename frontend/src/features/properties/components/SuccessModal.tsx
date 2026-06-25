import { CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { formatCurrency, formatMonths, formatYearMonth } from '@/shared/utils/formatters'

interface SuccessModalProps {
  open: boolean
  onClose: () => void
  propertyTitle: string
  totalAmount: number
  startMonth: string
  durationMonths: number
}

export const SuccessModal = ({ open, onClose, propertyTitle, totalAmount, startMonth, durationMonths }: SuccessModalProps) => (
  <Modal open={open} onClose={onClose} size="sm">
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">¡Reserva confirmada!</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{propertyTitle}</p>
      </div>
      <div className="w-full rounded-xl bg-gray-50 p-3 text-sm dark:bg-gray-700/50">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Inicio</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatYearMonth(startMonth)}</span>
        </div>
        <div className="mt-1 flex justify-between text-gray-600 dark:text-gray-400">
          <span>Duración</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatMonths(durationMonths)}</span>
        </div>
        <div className="mt-2 flex justify-between font-bold text-gray-900 dark:text-white">
          <span>Total pagado</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2">
        <Link to="/account/bookings" onClick={onClose}>
          <Button className="w-full" variant="primary">Ver mis reservas</Button>
        </Link>
        <Button variant="ghost" onClick={onClose} className="w-full">Seguir explorando</Button>
      </div>
    </div>
  </Modal>
)
