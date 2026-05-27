import { StepHeader } from '@/shared/components/ui/StepHeader'
import { WizardNav } from './WizardNav'
import { PROPERTY_TYPES } from '@/shared/utils/constants'
import { cn } from '@/shared/utils/cn'
import type { CreatePropertyDraft } from '../types/host.types'

interface StepProps {
  draft: CreatePropertyDraft
  update: (partial: Partial<CreatePropertyDraft>) => void
  onNext: () => void
  onPrev: () => void
}

export const Step1PropertyType = ({ draft, update, onNext, onPrev }: StepProps) => (
  <div>
    <StepHeader current={1} total={9} title="¿Qué tipo de propiedad es?" subtitle="Selecciona el tipo que mejor describe tu espacio." />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {PROPERTY_TYPES.map(type => (
        <button
          key={type.id}
          onClick={() => update({ type: type.id })}
          className={cn(
            'rounded-2xl border-2 p-4 text-center transition-all',
            draft.type === type.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <div className="mb-2 text-2xl">🏠</div>
          <p className="text-sm font-medium text-gray-900">{type.label}</p>
        </button>
      ))}
    </div>
    <WizardNav onPrev={onPrev} onNext={onNext} isFirst canNext={!!draft.type} />
  </div>
)
