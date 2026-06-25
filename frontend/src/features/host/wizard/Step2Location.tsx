import { StepHeader } from '@/shared/components/ui/StepHeader'
import { WizardNav } from './WizardNav'
import { Input } from '@/shared/components/ui/Input'
import { UniversityCombobox } from '@/shared/components/ui/UniversityCombobox'
import type { CreatePropertyDraft } from '../types/host.types'

interface StepProps {
  draft: CreatePropertyDraft
  update: (partial: Partial<CreatePropertyDraft>) => void
  onNext: () => void
  onPrev: () => void
}

const LIMA_DISTRICTS = [
  'Miraflores', 'San Isidro', 'Barranco', 'Surco', 'San Borja', 'La Molina',
  'Magdalena', 'Lince', 'Pueblo Libre', 'Jesús María', 'Breña', 'San Miguel',
  'Cercado de Lima', 'Rímac', 'SMP', 'Chorrillos', 'Callao',
]

export const Step2Location = ({ draft, update, onNext, onPrev }: StepProps) => (
  <div>
    <StepHeader current={2} total={9} title="¿Dónde está ubicada?" subtitle="Indica el distrito y la universidad más cercana." />
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Distrito</label>
        <select
          value={draft.district}
          onChange={e => update({ district: e.target.value })}
          className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Universidad más cercana</label>
        <UniversityCombobox
          value={draft.nearestUniversity}
          onChange={val => update({ nearestUniversity: val })}
          placeholder="Escribe o selecciona la universidad..."
        />
        <p className="text-xs text-gray-400">Los estudiantes buscan por universidad — complétalo para aparecer en más búsquedas.</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Tiempo a pie a la universidad</label>
          <span className="text-sm font-semibold text-primary">{draft.distanceToUniversityMinutes} min</span>
        </div>
        <input
          type="range"
          min={1}
          max={60}
          step={1}
          value={draft.distanceToUniversityMinutes}
          onChange={e => update({ distanceToUniversityMinutes: Number(e.target.value) })}
          className="w-full cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>1 min</span>
          <span>60 min</span>
        </div>
      </div>
    </div>

    <WizardNav
      onPrev={onPrev}
      onNext={onNext}
      canNext={!!draft.district && !!draft.address}
    />
  </div>
)
