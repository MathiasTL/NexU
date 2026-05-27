import { StepHeader } from '@/shared/components/ui/StepHeader'
import { WizardNav } from './WizardNav'
import type { CreatePropertyDraft } from '../types/host.types'

interface StepProps {
  draft: CreatePropertyDraft
  update: (partial: Partial<CreatePropertyDraft>) => void
  onNext: () => void
  onPrev: () => void
}

const MAX = 500

export const Step7Description = ({ draft, update, onNext, onPrev }: StepProps) => (
  <div>
    <StepHeader current={7} total={9} title="Describe tu propiedad" subtitle="Cuéntale a los huéspedes qué hace especial tu espacio." />
    <div className="flex flex-col gap-2">
      <textarea
        value={draft.description}
        onChange={e => update({ description: e.target.value.slice(0, MAX) })}
        className="h-40 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        placeholder="Describe las características únicas de tu propiedad, la zona, qué hay cerca..."
      />
      <p className="text-right text-xs text-gray-400">{draft.description.length}/{MAX}</p>
    </div>
    <WizardNav onPrev={onPrev} onNext={onNext} canNext={draft.description.trim().length > 20} />
  </div>
)
