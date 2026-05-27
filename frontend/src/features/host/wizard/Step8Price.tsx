import { StepHeader } from '@/shared/components/ui/StepHeader'
import { WizardNav } from './WizardNav'
import { formatCurrency } from '@/shared/utils/formatters'
import type { CreatePropertyDraft } from '../types/host.types'

interface StepProps {
  draft: CreatePropertyDraft
  update: (partial: Partial<CreatePropertyDraft>) => void
  onNext: () => void
  onPrev: () => void
}

export const Step8Price = ({ draft, update, onNext, onPrev }: StepProps) => {
  const serviceFee = Math.round(draft.pricePerNight * 0.14)
  const guestPays = draft.pricePerNight + serviceFee

  return (
    <div>
      <StepHeader current={8} total={9} title="Establece tu precio por noche" subtitle="Puedes ajustarlo en cualquier momento." />
      <div className="mb-6 flex flex-col items-center gap-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">S/</span>
          <input
            type="number"
            value={draft.pricePerNight}
            onChange={e => update({ pricePerNight: Math.max(1, Number(e.target.value)) })}
            className="h-20 w-48 rounded-2xl border-2 border-gray-200 pl-14 pr-4 text-3xl font-bold text-gray-900 outline-none focus:border-blue-500"
            min={1}
          />
        </div>
        <div className="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Precio base</span>
            <span>{formatCurrency(draft.pricePerNight)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tarifa de servicio (14%)</span>
            <span>{formatCurrency(serviceFee)}</span>
          </div>
          <hr className="my-2 border-gray-100" />
          <div className="flex justify-between font-semibold text-gray-900">
            <span>El huésped paga</span>
            <span>{formatCurrency(guestPays)}</span>
          </div>
        </div>
      </div>
      <WizardNav onPrev={onPrev} onNext={onNext} canNext={draft.pricePerNight > 0} />
    </div>
  )
}
