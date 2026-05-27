import { StepHeader } from '@/shared/components/ui/StepHeader'
import { WizardNav } from './WizardNav'
import { Input } from '@/shared/components/ui/Input'
import type { CreatePropertyDraft } from '../types/host.types'

interface StepProps {
  draft: CreatePropertyDraft
  update: (partial: Partial<CreatePropertyDraft>) => void
  onNext: () => void
  onPrev: () => void
}

const LIMA_DISTRICTS = ['Miraflores', 'San Isidro', 'Barranco', 'Surco', 'San Borja', 'La Molina', 'Magdalena', 'Lince', 'Pueblo Libre', 'Jesús María', 'Chorrillos', 'Callao']

export const Step2Location = ({ draft, update, onNext, onPrev }: StepProps) => (
  <div>
    <StepHeader current={2} total={9} title="¿Dónde está ubicada?" subtitle="Indica la dirección exacta de tu propiedad." />
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Distrito</label>
        <select
          value={draft.district}
          onChange={e => update({ district: e.target.value })}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">Selecciona un distrito</option>
          {LIMA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <Input
        label="Dirección"
        value={draft.address}
        onChange={e => update({ address: e.target.value })}
        placeholder="Av. Larco 1150"
      />
      <Input
        label="Referencia (opcional)"
        value={draft.location}
        onChange={e => update({ location: e.target.value })}
        placeholder="Cerca al Parque Kennedy"
      />
    </div>
    <WizardNav onPrev={onPrev} onNext={onNext} canNext={!!draft.district && !!draft.address} />
  </div>
)
