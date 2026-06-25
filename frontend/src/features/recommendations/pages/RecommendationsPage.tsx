import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import { UniversityCombobox } from '@/shared/components/ui/UniversityCombobox'
import { PropertyCard } from '@/features/properties/components/PropertyCard'
import { propertyService } from '@/features/properties/services/property.service'
import { calcCompatibility } from '@/features/properties/utils/compatibility'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/utils/cn'
import type { Property, RoomType } from '@/features/properties/types/property.types'
import type { LifestylePreferences } from '@/features/account/types/account.types'

// ─── Step definitions ────────────────────────────────────────────────────────

const STEPS = ['Universidad', 'Presupuesto', 'Tipo de espacio', 'Convivencia'] as const
type Step = 0 | 1 | 2 | 3

const ROOM_TYPES: { value: RoomType; label: string; desc: string }[] = [
  { value: 'room',      label: '🛏 Habitación privada', desc: 'Solo para ti, en una casa o depa compartido' },
  { value: 'shared',    label: '🤝 Cuarto compartido',  desc: 'Con roommates, muy económico' },
  { value: 'studio',    label: '🏠 Estudio',            desc: 'Espacio independiente completo' },
  { value: 'apartment', label: '🏢 Departamento',       desc: 'Depa completo, ideal para 2' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export const RecommendationsPage = () => {
  const navigate = useNavigate()
  const [step,     setStep]     = useState<Step>(0)
  const [loading,  setLoading]  = useState(false)
  const [results,  setResults]  = useState<{ property: Property; score: number }[]>([])
  const [showResults, setShowResults] = useState(false)

  const [university,  setUniversity]  = useState('')
  const [budget,      setBudget]      = useState(1000)
  const [roomType,    setRoomType]    = useState<RoomType | ''>('')
  const [sleepSched,  setSleepSched]  = useState<'early' | 'night' | ''>('')
  const [studyHabits, setStudyHabits] = useState<'light' | 'moderate' | 'intense' | ''>('')
  const [noiseLevel,  setNoiseLevel]  = useState<'quiet' | 'moderate' | 'lively' | ''>('')

  const canNext = [
    !!university,
    budget > 0,
    !!roomType,
    true,
  ][step]

  const handleNext = () => {
    if (step < 3) { setStep(s => (s + 1) as Step); return }
    handleSearch()
  }

  const handleSearch = async () => {
    setLoading(true)
    const prefs: LifestylePreferences = {
      targetUniversity: university,
      maxMonthlyBudget: budget,
      sleepSchedule:    sleepSched,
      studyHabits:      studyHabits,
      noiseLevel:       noiseLevel,
      cleanliness:      '',
      guestsPolicy:     '',
      smokingPolicy:    '',
      petsPolicy:       '',
    }

    const all = await propertyService.search({
      nearestUniversity: university || undefined,
      roomType:          roomType || undefined,
      maxPricePerMonth:  budget,
    })

    const scored = all
      .map(p => ({ property: p, score: calcCompatibility(prefs, p).score }))
      .sort((a, b) => b.score - a.score)

    setResults(scored)
    setLoading(false)
    setShowResults(true)
  }

  if (showResults) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => setShowResults(false)} className="rounded-xl border border-gray-200 p-2 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tus espacios recomendados</h1>
            <p className="text-sm text-gray-500">{results.length} espacios ordenados por compatibilidad</p>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center">
            <p className="text-gray-500">No encontramos espacios con esos criterios.</p>
            <Button variant="outline" className="mt-4" onClick={() => setShowResults(false)}>Ajustar búsqueda</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map(({ property, score }) => (
              <div key={property.id} className="relative">
                <PropertyCard property={property} />
                {score > 0 && (
                  <div className={cn(
                    'absolute left-3 bottom-16 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm',
                    score >= 70 ? 'bg-green-500 text-white' : score >= 40 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
                  )}>
                    {score}% compatible
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Encuentra tu espacio ideal</h1>
        <p className="mt-1 text-sm text-gray-500">Responde {STEPS.length} preguntas rápidas y te mostramos las mejores opciones</p>
      </div>

      {/* Progress */}
      <div className="mb-8 flex gap-1.5">
        {STEPS.map((_, i) => (
          <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors', i <= step ? 'bg-primary' : 'bg-gray-200')} />
        ))}
      </div>

      {/* Steps */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Paso {step + 1} de {STEPS.length}</p>
        <h2 className="mb-6 text-lg font-bold text-gray-900">{STEPS[step]}</h2>

        {/* Step 0: Universidad */}
        {step === 0 && (
          <div>
            <p className="mb-3 text-sm text-gray-600">¿Cerca de qué universidad buscas alojamiento?</p>
            <UniversityCombobox value={university} onChange={setUniversity} placeholder="Escribe o selecciona tu universidad..." />
          </div>
        )}

        {/* Step 1: Presupuesto */}
        {step === 1 && (
          <div>
            <p className="mb-4 text-sm text-gray-600">¿Cuánto puedes pagar al mes?</p>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">Presupuesto máximo</span>
              <span className="text-lg font-bold text-primary">S/ {budget.toLocaleString()}</span>
            </div>
            <input type="range" min={200} max={3000} step={50} value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-orange-500" />
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>S/ 200</span><span>S/ 3,000</span>
            </div>
          </div>
        )}

        {/* Step 2: Tipo */}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            {ROOM_TYPES.map(rt => (
              <button key={rt.value} type="button" onClick={() => setRoomType(rt.value)}
                className={cn(
                  'flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all',
                  roomType === rt.value ? 'border-primary bg-primary-50' : 'border-gray-200 hover:border-gray-300',
                )}>
                <span className="text-2xl">{rt.label.split(' ')[0]}</span>
                <div>
                  <p className={cn('font-semibold', roomType === rt.value ? 'text-primary-700' : 'text-gray-900')}>
                    {rt.label.split(' ').slice(1).join(' ')}
                  </p>
                  <p className="text-xs text-gray-500">{rt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Convivencia */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">¿Cuándo te acuestas?</p>
              <div className="flex gap-2">
                {[{ label: '🌅 Antes de las 11pm', value: 'early' as const }, { label: '🌙 Después de medianoche', value: 'night' as const }].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setSleepSched(v => v === opt.value ? '' : opt.value)}
                    className={cn('flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                      sleepSched === opt.value ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-600 hover:border-primary-300')}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">¿Cómo estudias en casa?</p>
              <div className="flex gap-2">
                {[{ label: '📖 Poco', value: 'light' as const }, { label: '📚 Regular', value: 'moderate' as const }, { label: '🎓 Intenso', value: 'intense' as const }].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setStudyHabits(v => v === opt.value ? '' : opt.value)}
                    className={cn('flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                      studyHabits === opt.value ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-600 hover:border-primary-300')}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Ambiente que prefieres</p>
              <div className="flex gap-2">
                {[{ label: '🤫 Silencio', value: 'quiet' as const }, { label: '🎵 Moderado', value: 'moderate' as const }, { label: '🎉 Animado', value: 'lively' as const }].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setNoiseLevel(v => v === opt.value ? '' : opt.value)}
                    className={cn('flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                      noiseLevel === opt.value ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-600 hover:border-primary-300')}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button onClick={() => step > 0 && setStep(s => (s - 1) as Step)}
          disabled={step === 0}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 disabled:opacity-30 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>
        <Button onClick={handleNext} disabled={!canNext || loading} loading={loading} size="lg" className="px-8">
          {step < 3 ? 'Siguiente' : 'Ver resultados'}
          {step < 3 && <ArrowRight className="ml-1 h-4 w-4" />}
        </Button>
      </div>

      <button onClick={() => navigate('/search')}
        className="mt-4 w-full text-center text-sm text-gray-400 hover:text-gray-600 hover:underline">
        Prefiero buscar por mi cuenta →
      </button>
    </div>
  )
}
