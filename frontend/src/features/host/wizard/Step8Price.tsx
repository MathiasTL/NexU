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

const AVAILABILITY_OPTIONS: { value: CreatePropertyDraft['availabilityStatus']; label: string; desc: string }[] = [
  { value: 'available',   label: '✅ Disponible',       desc: 'Listo para recibir estudiantes ahora' },
  { value: 'reserved',    label: '🟡 Reservado',         desc: 'Casi completo o con solicitud pendiente' },
  { value: 'unavailable', label: '🔴 No disponible',     desc: 'Temporalmente fuera de servicio' },
]

export const Step8Price = ({ draft, update, onNext, onPrev }: StepProps) => {
  const serviceFee = Math.round(draft.pricePerMonth * 0.14)
  const tenantPays = draft.pricePerMonth + serviceFee

  return (
    <div>
      <StepHeader current={8} total={9} title="Precio y disponibilidad" subtitle="El precio mensual es lo primero que verán los estudiantes." />

      {/* Monthly price — primary */}
      <div className="mb-6 flex flex-col items-center gap-4">
        <div>
          <p className="mb-2 text-center text-sm font-medium text-gray-500">Precio por mes (S/)</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">S/</span>
            <input
              type="number"
              value={draft.pricePerMonth}
              onChange={e => update({ pricePerMonth: Math.max(1, Number(e.target.value)) })}
              className="h-20 w-52 rounded-2xl border-2 border-gray-200 pl-14 pr-4 text-3xl font-bold text-gray-900 outline-none focus:border-primary"
              min={1}
            />
          </div>
        </div>

        <div className="w-full max-w-xs rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Precio mensual</span>
            <span>{formatCurrency(draft.pricePerMonth)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Tarifa de servicio (14%)</span>
            <span>{formatCurrency(serviceFee)}</span>
          </div>
          <hr className="my-2 border-gray-100" />
          <div className="flex justify-between font-semibold text-gray-900">
            <span>El estudiante paga</span>
            <span>{formatCurrency(tenantPays)}</span>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-medium text-gray-700">Estado de disponibilidad</p>
        <div className="flex flex-col gap-2">
          {AVAILABILITY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ availabilityStatus: opt.value })}
              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition-all ${
                draft.availabilityStatus === opt.value
                  ? 'border-primary bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-500">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <WizardNav onPrev={onPrev} onNext={onNext} canNext={draft.pricePerMonth > 0} />
    </div>
  )
}
