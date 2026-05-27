import { useState } from 'react'
import { X, Home, MapPin, Users, DollarSign, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/utils/cn'
import {
  type AdvancedFiltersValue,
  DEFAULT_ADVANCED_FILTERS,
} from '../types/property.types'

interface AdvancedFiltersProps {
  open: boolean
  onClose: () => void
  value: AdvancedFiltersValue
  onApply: (filters: AdvancedFiltersValue) => void
}

// ── Internal sub-components ───────────────────────────────────────────────────

const Counter = ({
  value,
  onChange,
  min = 0,
  max = 10,
}: {
  value: number | null
  onChange: (v: number | null) => void
  min?: number
  max?: number
}) => {
  const current = value ?? 0
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(current <= min ? null : current - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-blue-400 hover:text-blue-600 disabled:opacity-40"
        disabled={current <= min}
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-semibold text-gray-900">
        {value === null ? 'Cualq.' : current}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(current + 1, max))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-blue-400 hover:text-blue-600 disabled:opacity-40"
        disabled={current >= max}
      >
        +
      </button>
    </div>
  )
}

const ToggleGroup = <T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value === value ? ('' as T) : opt.value)}
        className={cn(
          'rounded-full border px-3 py-1 text-xs font-medium transition-all',
          value === opt.value
            ? 'border-blue-600 bg-blue-600 text-white'
            : 'border-gray-200 bg-white text-gray-600 hover:border-blue-400',
        )}
      >
        {opt.label}
      </button>
    ))}
  </div>
)

const SectionTitle = ({
  icon: Icon,
  title,
}: {
  icon: React.ElementType
  title: string
}) => (
  <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
    <Icon className="h-4 w-4 text-blue-600" />
    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
  </div>
)

const PROPERTY_TYPES = [
  { value: '', label: 'Cualquiera' },
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Casa' },
  { value: 'studio', label: 'Estudio' },
  { value: 'room', label: 'Habitación' },
]

const SERVICES = [
  { id: 'electricity', label: 'Luz' },
  { id: 'water', label: 'Agua' },
  { id: 'internet', label: 'Internet' },
  { id: 'gas', label: 'Gas' },
]

// ── Count active filters ───────────────────────────────────────────────────────

export const countActiveFilters = (f: AdvancedFiltersValue): number => {
  let n = 0
  if (f.propertyType) n++
  if (f.bedrooms !== null) n++
  if (f.bathrooms !== null) n++
  if (f.university) n++
  if (f.travelMinutes !== null) n++
  if (f.sleepSchedule) n++
  if (f.noiseLevel) n++
  if (f.petsAllowed !== null) n++
  if (f.cleaningLevel) n++
  if (f.studyHabits) n++
  if (f.roommateCount !== null) n++
  if (f.maxPrice !== null) n++
  n += f.servicesIncluded.length
  return n
}

// ── Main component ─────────────────────────────────────────────────────────────

export const AdvancedFilters = ({ open, onClose, value, onApply }: AdvancedFiltersProps) => {
  const [draft, setDraft] = useState<AdvancedFiltersValue>(value)

  const set = <K extends keyof AdvancedFiltersValue>(
    key: K,
    val: AdvancedFiltersValue[K],
  ) => setDraft(prev => ({ ...prev, [key]: val }))

  const toggleService = (id: string) => {
    setDraft(prev => ({
      ...prev,
      servicesIncluded: prev.servicesIncluded.includes(id)
        ? prev.servicesIncluded.filter(s => s !== id)
        : [...prev.servicesIncluded, id],
    }))
  }

  const handleReset = () => setDraft(DEFAULT_ADVANCED_FILTERS)

  const handleApply = () => {
    onApply(draft)
    onClose()
  }

  if (!open) return null

  const activeCount = countActiveFilters(draft)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">Filtros Avanzados</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="max-h-[70vh] overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

            {/* ── 1. Del inmueble ──────────────────────────────────────── */}
            <div>
              <SectionTitle icon={Home} title="Del inmueble" />
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Tipo de vivienda
                  </label>
                  <select
                    value={draft.propertyType}
                    onChange={e => set('propertyType', e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    {PROPERTY_TYPES.map(t => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">Dormitorios</label>
                  <Counter
                    value={draft.bedrooms}
                    onChange={v => set('bedrooms', v)}
                    max={6}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">Baños</label>
                  <Counter
                    value={draft.bathrooms}
                    onChange={v => set('bathrooms', v)}
                    max={4}
                  />
                </div>
              </div>
            </div>

            {/* ── 2. Ubicación ─────────────────────────────────────────── */}
            <div>
              <SectionTitle icon={MapPin} title="Ubicación" />
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Universidad cercana
                  </label>
                  <input
                    type="text"
                    value={draft.university}
                    onChange={e => set('university', e.target.value)}
                    placeholder="ej. UNMSM, PUCP, UPC..."
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">
                      Tiempo de viaje (máx.)
                    </label>
                    <span className="text-xs font-semibold text-blue-600">
                      {draft.travelMinutes !== null ? `${draft.travelMinutes} min` : 'Cualquiera'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    step={5}
                    value={draft.travelMinutes ?? 60}
                    onChange={e => set('travelMinutes', Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-600"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                    <span>5 min</span>
                    <span>60 min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. Convivencia ───────────────────────────────────────── */}
            <div>
              <SectionTitle icon={Users} title="Convivencia" />
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">N.° de roommates</label>
                  <Counter
                    value={draft.roommateCount}
                    onChange={v => set('roommateCount', v)}
                    max={8}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Horario de sueño
                  </label>
                  <ToggleGroup
                    options={[
                      { value: 'morning', label: '🌅 Mañanero' },
                      { value: 'night', label: '🌙 Nocturno' },
                    ]}
                    value={draft.sleepSchedule}
                    onChange={v => set('sleepSchedule', v)}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Nivel de ruido
                  </label>
                  <ToggleGroup
                    options={[
                      { value: 'low', label: '🔇 Bajo' },
                      { value: 'medium', label: '🔉 Medio' },
                      { value: 'high', label: '🔊 Alto' },
                    ]}
                    value={draft.noiseLevel}
                    onChange={v => set('noiseLevel', v)}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Mascotas
                  </label>
                  <div className="flex gap-2">
                    {[
                      { label: '✓ Sí', val: true },
                      { label: '✗ No', val: false },
                    ].map(({ label, val }) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() =>
                          set('petsAllowed', draft.petsAllowed === val ? null : val)
                        }
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                          draft.petsAllowed === val
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-blue-400',
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Limpieza
                  </label>
                  <ToggleGroup
                    options={[
                      { value: 'low', label: 'Flexible' },
                      { value: 'medium', label: 'Ordenado' },
                      { value: 'high', label: 'Muy limpio' },
                    ]}
                    value={draft.cleaningLevel}
                    onChange={v => set('cleaningLevel', v)}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Hábitos de estudio
                  </label>
                  <ToggleGroup
                    options={[
                      { value: 'quiet', label: '📚 Silencio' },
                      { value: 'mixed', label: '🎧 Mixto' },
                      { value: 'social', label: '💬 Social' },
                    ]}
                    value={draft.studyHabits}
                    onChange={v => set('studyHabits', v)}
                  />
                </div>
              </div>
            </div>

            {/* ── 4. Económicos ────────────────────────────────────────── */}
            <div>
              <SectionTitle icon={DollarSign} title="Económicos" />
              <div className="flex flex-col gap-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">
                      Precio máximo (S/)
                    </label>
                    {draft.maxPrice !== null && (
                      <span className="text-xs font-semibold text-blue-600">
                        S/ {draft.maxPrice}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min={50}
                    max={2000}
                    placeholder="Sin límite"
                    value={draft.maxPrice ?? ''}
                    onChange={e =>
                      set('maxPrice', e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-600">
                    Servicios incluidos
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SERVICES.map(svc => (
                      <label
                        key={svc.id}
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 transition-colors hover:border-blue-300"
                      >
                        <input
                          type="checkbox"
                          checked={draft.servicesIncluded.includes(svc.id)}
                          onChange={() => toggleService(svc.id)}
                          className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                        />
                        <span className="text-xs font-medium text-gray-700">{svc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar todo
          </button>
          <Button onClick={handleApply} size="md">
            {activeCount > 0
              ? `Aplicar filtros (${activeCount})`
              : 'Aplicar filtros'}
          </Button>
        </div>
      </div>
    </div>
  )
}
