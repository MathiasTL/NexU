import { Minus, Plus } from 'lucide-react'
import { StepHeader } from '@/shared/components/ui/StepHeader'
import { WizardNav } from './WizardNav'
import type { CreatePropertyDraft } from '../types/host.types'

interface StepProps {
  draft: CreatePropertyDraft
  update: (partial: Partial<CreatePropertyDraft>) => void
  onNext: () => void
  onPrev: () => void
}

interface CounterProps {
  label: string
  value: number
  min?: number
  max?: number
  onChange: (v: number) => void
}

const Counter = ({ label, value, min = 1, max = 20, onChange }: CounterProps) => (
  <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-4 text-center font-semibold text-gray-900">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
        disabled={value >= max}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  </div>
)

export const Step3Capacity = ({ draft, update, onNext, onPrev }: StepProps) => (
  <div>
    <StepHeader current={3} total={9} title="¿Cuántas personas puede alojar?" subtitle="Indica la capacidad máxima de tu propiedad." />
    <div className="flex flex-col gap-3">
      <Counter label="Huéspedes" value={draft.capacity} onChange={v => update({ capacity: v })} max={16} />
      <Counter label="Habitaciones" value={draft.bedrooms} onChange={v => update({ bedrooms: v })} />
      <Counter label="Camas" value={draft.beds} onChange={v => update({ beds: v })} />
      <Counter label="Baños" value={draft.bathrooms} onChange={v => update({ bathrooms: v })} />
    </div>
    <WizardNav onPrev={onPrev} onNext={onNext} />
  </div>
)
