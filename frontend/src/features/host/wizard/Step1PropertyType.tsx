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
    <StepHeader current={1} total={9} title="¿Qué tipo de espacio ofreces?" subtitle="Selecciona el que mejor describe tu propiedad." />
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {PROPERTY_TYPES.map(type => (
        <button
          key={type.id}
          onClick={() => update({ type: type.id, roomType: type.id })}
          className={cn(
            'flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all',
            draft.roomType === type.id ? 'border-primary bg-primary-50' : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <span className="mt-0.5 text-3xl">{type.emoji}</span>
          <div>
            <p className={cn('font-semibold', draft.roomType === type.id ? 'text-primary-700' : 'text-gray-900')}>
              {type.label}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">{type.description}</p>
          </div>
        </button>
      ))}
    </div>
    <WizardNav onPrev={onPrev} onNext={onNext} isFirst canNext={!!draft.roomType} />
  </div>
)
