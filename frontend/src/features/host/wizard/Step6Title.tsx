import { StepHeader } from '@/shared/components/ui/StepHeader'
import { WizardNav } from './WizardNav'
import type { CreatePropertyDraft } from '../types/host.types'

interface StepProps {
  draft: CreatePropertyDraft
  update: (partial: Partial<CreatePropertyDraft>) => void
  onNext: () => void
  onPrev: () => void
}

const MAX = 60

export const Step6Title = ({ draft, update, onNext, onPrev }: StepProps) => (
  <div>
    <StepHeader current={6} total={9} title="Dale un título a tu propiedad" subtitle="Un título atractivo es lo primero que verán los huéspedes." />
    <div className="flex flex-col gap-2">
      <textarea
        value={draft.title}
        onChange={e => update({ title: e.target.value.slice(0, MAX) })}
        className="h-24 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-lg font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        placeholder="Ej: Penthouse con vista al mar en Miraflores"
      />
      <p className="text-right text-xs text-gray-400">{draft.title.length}/{MAX}</p>
    </div>
    <WizardNav onPrev={onPrev} onNext={onNext} canNext={draft.title.trim().length > 5} />
  </div>
)
