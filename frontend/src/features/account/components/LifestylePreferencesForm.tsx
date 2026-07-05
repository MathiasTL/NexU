import { useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/components/ui/Button'
import { UniversityCombobox } from '@/shared/components/ui/UniversityCombobox'
import { DEFAULT_LIFESTYLE, type LifestylePreferences } from '../types/account.types'

interface ChipGroupProps<T extends string> {
  options: { label: string; value: T }[]
  value: T | ''
  onChange: (v: T | '') => void
}

function ChipGroup<T extends string>({ options, value, onChange }: ChipGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt.value} type="button"
          onClick={() => onChange(value === opt.value ? '' : opt.value)}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            value === opt.value
              ? 'border-primary bg-primary text-white'
              : 'border-gray-200 text-gray-600 hover:border-primary-300',
          )}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

interface LifestylePreferencesFormProps {
  initial?: LifestylePreferences
  onSave:   (prefs: LifestylePreferences) => void
  loading?: boolean
}

export const LifestylePreferencesForm = ({
  initial = DEFAULT_LIFESTYLE,
  onSave,
  loading = false,
}: LifestylePreferencesFormProps) => {
  const [prefs, setPrefs] = useState<LifestylePreferences>(initial)

  const set = <K extends keyof LifestylePreferences>(key: K, val: LifestylePreferences[K]) =>
    setPrefs(prev => ({ ...prev, [key]: val }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(prefs)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

      {/* Universidad */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">¿En qué universidad estudias?</label>
        <UniversityCombobox value={prefs.targetUniversity} onChange={v => set('targetUniversity', v)} placeholder="Selecciona tu universidad..." />
      </div>

      {/* Presupuesto */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-800">Presupuesto mensual máximo</label>
          <span className="text-sm font-bold text-primary">
            {prefs.maxMonthlyBudget > 0 ? `S/ ${prefs.maxMonthlyBudget.toLocaleString()}` : 'Sin definir'}
          </span>
        </div>
        {/* Cuando el presupuesto está sin definir (0), el thumb se ancla en el
            mínimo para que la posición visual no sugiera un valor que no se
            guardaría. Se define en cuanto el usuario mueve el control. */}
        <input type="range" min={200} max={3000} step={50}
          value={prefs.maxMonthlyBudget || 200}
          onChange={e => set('maxMonthlyBudget', Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-orange-500"
          style={prefs.maxMonthlyBudget > 0 ? undefined : { opacity: 0.5 }} />
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>S/ 200</span><span>S/ 3,000</span>
        </div>
      </div>

      {/* Horario de sueño */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">¿Cuál es tu horario de sueño?</label>
        <ChipGroup
          options={[
            { label: '🌅 Madrugador (acuesto antes de las 11pm)', value: 'early' as const },
            { label: '🌙 Noctámbulo (acuesto después de las 12am)', value: 'night' as const },
          ]}
          value={prefs.sleepSchedule}
          onChange={v => set('sleepSchedule', v as typeof prefs.sleepSchedule)}
        />
      </div>

      {/* Estudio */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">¿Cómo son tus hábitos de estudio en casa?</label>
        <ChipGroup
          options={[
            { label: '📖 Estudio poco en casa', value: 'light' as const },
            { label: '📚 Estudio moderadamente', value: 'moderate' as const },
            { label: '🎓 Estudio intensamente', value: 'intense' as const },
          ]}
          value={prefs.studyHabits}
          onChange={v => set('studyHabits', v as typeof prefs.studyHabits)}
        />
      </div>

      {/* Ruido */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">¿Qué ambiente prefieres en casa?</label>
        <ChipGroup
          options={[
            { label: '🤫 Silencio y tranquilidad', value: 'quiet' as const },
            { label: '🎵 Ambiente moderado', value: 'moderate' as const },
            { label: '🎉 Ambiente animado', value: 'lively' as const },
          ]}
          value={prefs.noiseLevel}
          onChange={v => set('noiseLevel', v as typeof prefs.noiseLevel)}
        />
      </div>

      {/* Limpieza */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">¿Cómo eres con la limpieza?</label>
        <ChipGroup
          options={[
            { label: '😌 Relajado/a', value: 'relaxed' as const },
            { label: '🧹 Promedio', value: 'average' as const },
            { label: '✨ Muy organizado/a', value: 'strict' as const },
          ]}
          value={prefs.cleanliness}
          onChange={v => set('cleanliness', v as typeof prefs.cleanliness)}
        />
      </div>

      {/* Visitas */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">¿Recibes visitas en casa?</label>
        <ChipGroup
          options={[
            { label: '🙅 Nunca / casi nunca', value: 'never' as const },
            { label: '👋 Ocasionalmente', value: 'occasionally' as const },
            { label: '🏠 Frecuentemente', value: 'often' as const },
          ]}
          value={prefs.guestsPolicy}
          onChange={v => set('guestsPolicy', v as typeof prefs.guestsPolicy)}
        />
      </div>

      {/* Mascotas */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">¿Tienes o planeas tener mascotas?</label>
        <ChipGroup
          options={[
            { label: '🐾 Sí', value: 'yes' as const },
            { label: '🚫 No', value: 'no' as const },
          ]}
          value={prefs.petsPolicy}
          onChange={v => set('petsPolicy', v as typeof prefs.petsPolicy)}
        />
      </div>

      {/* Fumador */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">¿Fumas?</label>
        <ChipGroup
          options={[
            { label: '🚭 No fumo', value: 'no' as const },
            { label: '🚬 Solo en exteriores', value: 'outside' as const },
          ]}
          value={prefs.smokingPolicy}
          onChange={v => set('smokingPolicy', v as typeof prefs.smokingPolicy)}
        />
      </div>

      <Button type="submit" size="lg" loading={loading} className="w-full sm:w-auto">
        Guardar preferencias
      </Button>
    </form>
  )
}
