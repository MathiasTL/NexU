import { useState } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/utils/cn'
import { UniversityCombobox } from '@/shared/components/ui/UniversityCombobox'

export interface AdvancedFilterValues {
  housingType: string
  bedrooms: number | null
  bathrooms: number | null
  nearUniversity: string
  district: string
  travelTime: number
  roommatesCount: number | null
  sleepSchedule: 'morning' | 'night' | ''
  noiseLevel: 'low' | 'medium' | 'high' | ''
  petsAllowed: boolean | null
  cleanliness: 'low' | 'medium' | 'high' | ''
  studyHabits: 'rarely' | 'sometimes' | 'often' | ''
  maxPrice: number | null
  expenseSplit: 'equal' | 'per-room' | ''
  includedServices: string[]
}

export const DEFAULT_FILTERS: AdvancedFilterValues = {
  housingType: '',
  bedrooms: null,
  bathrooms: null,
  nearUniversity: '',
  district: '',
  travelTime: 30,
  roommatesCount: null,
  sleepSchedule: '',
  noiseLevel: '',
  petsAllowed: null,
  cleanliness: '',
  studyHabits: '',
  maxPrice: null,
  expenseSplit: '',
  includedServices: [],
}

interface AdvancedFiltersProps {
  isOpen: boolean
  onClose: () => void
  onApply: (values: AdvancedFilterValues) => void
  initialValues?: AdvancedFilterValues
}

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────

const SectionHeader = ({
  title,
  open,
  onToggle,
}: {
  title: string
  open: boolean
  onToggle: () => void
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-gray-800"
  >
    {title}
    {open ? (
      <ChevronUp className="h-4 w-4 text-gray-400" />
    ) : (
      <ChevronDown className="h-4 w-4 text-gray-400" />
    )}
  </button>
)

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
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(current <= min ? null : current - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        disabled={current <= min}
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-medium text-gray-900">
        {value === null ? '—' : value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, current + 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        disabled={current >= max}
      >
        +
      </button>
    </div>
  )
}

const ChipGroup = <T extends string>({
  options,
  value,
  onChange,
  multi = false,
}: {
  options: { label: string; value: T }[]
  value: T | T[] | null | ''
  onChange: (v: T | T[] | null) => void
  multi?: boolean
}) => {
  const isSelected = (v: T) => {
    if (multi) return Array.isArray(value) && value.includes(v)
    return value === v
  }
  const handleClick = (v: T) => {
    if (multi) {
      const arr = Array.isArray(value) ? [...value] : []
      onChange(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v])
    } else {
      onChange(value === v ? null : v)
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => handleClick(opt.value)}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            isSelected(opt.value)
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-gray-300 text-gray-600 hover:border-blue-400',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

const SERVICES = ['Luz', 'Agua', 'Internet', 'Gas', 'Cable']

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────

export const AdvancedFilters = ({
  isOpen,
  onClose,
  onApply,
  initialValues = DEFAULT_FILTERS,
}: AdvancedFiltersProps) => {
  const [values, setValues] = useState<AdvancedFilterValues>(initialValues)
  const [openSections, setOpenSections] = useState({
    property: true,
    location: true,
    cohabitation: false,
    economic: false,
  })

  const set = <K extends keyof AdvancedFilterValues>(key: K, val: AdvancedFilterValues[K]) =>
    setValues(prev => ({ ...prev, [key]: val }))

  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const handleReset = () => setValues(DEFAULT_FILTERS)

  const toggleService = (service: string) => {
    const curr = values.includedServices
    set(
      'includedServices',
      curr.includes(service) ? curr.filter(s => s !== service) : [...curr, service],
    )
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[90dvh] flex-col rounded-t-2xl bg-white shadow-2xl md:bottom-auto md:left-1/2 md:top-[5%] md:max-h-[88vh] md:w-full md:max-w-2xl md:-translate-x-1/2 md:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-900">Filtros avanzados</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6">
          {/* ── Section 1: Inmueble ── */}
          <div className="border-b border-gray-100">
            <SectionHeader
              title="Filtros del inmueble"
              open={openSections.property}
              onToggle={() => toggleSection('property')}
            />
            {openSections.property && (
              <div className="grid grid-cols-1 gap-5 pb-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500">Tipo de vivienda</label>
                  <select
                    value={values.housingType}
                    onChange={e => set('housingType', e.target.value)}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Cualquiera</option>
                    <option value="room">Habitación</option>
                    <option value="apartment">Departamento</option>
                    <option value="house">Casa</option>
                    <option value="studio">Estudio</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500">Tamaño del espacio</label>
                  <select
                    value={values.housingType}
                    onChange={e => set('housingType', e.target.value)}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Cualquier tamaño</option>
                    <option value="small">Pequeño (&lt;15 m²)</option>
                    <option value="medium">Mediano (15–30 m²)</option>
                    <option value="large">Grande (&gt;30 m²)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-500">Dormitorios</label>
                  <Counter value={values.bedrooms} onChange={v => set('bedrooms', v)} max={6} />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-500">Baños</label>
                  <Counter value={values.bathrooms} onChange={v => set('bathrooms', v)} max={4} />
                </div>
              </div>
            )}
          </div>

          {/* ── Section 2: Ubicación ── */}
          <div className="border-b border-gray-100">
            <SectionHeader
              title="Filtros de ubicación"
              open={openSections.location}
              onToggle={() => toggleSection('location')}
            />
            {openSections.location && (
              <div className="grid grid-cols-1 gap-5 pb-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500">Universidad cercana</label>
                  <UniversityCombobox
                    value={values.nearUniversity}
                    onChange={v => set('nearUniversity', v)}
                    placeholder="Todas las universidades"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500">Distrito</label>
                  <input
                    type="text"
                    value={values.district}
                    onChange={e => set('district', e.target.value)}
                    placeholder="Miraflores, San Isidro..."
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="col-span-full flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500">
                      Tiempo de viaje máx.
                    </label>
                    <span className="text-xs font-semibold text-blue-600">
                      {values.travelTime} min
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    step={5}
                    value={values.travelTime}
                    onChange={e => set('travelTime', Number(e.target.value))}
                    className="h-2 w-full cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>5 min</span>
                    <span>60 min</span>
                  </div>
                </div>

                <div className="col-span-full flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-6 text-sm text-gray-400">
                  🗺️ Mapa interactivo (próximamente)
                </div>
              </div>
            )}
          </div>

          {/* ── Section 3: Convivencia ── */}
          <div className="border-b border-gray-100">
            <SectionHeader
              title="Filtros de convivencia"
              open={openSections.cohabitation}
              onToggle={() => toggleSection('cohabitation')}
            />
            {openSections.cohabitation && (
              <div className="grid grid-cols-1 gap-5 pb-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-500">N.° de roommates</label>
                  <Counter
                    value={values.roommatesCount}
                    onChange={v => set('roommatesCount', v)}
                    max={8}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500">Horario de sueño</label>
                  <ChipGroup
                    options={[
                      { label: '🌅 Mañana', value: 'morning' as const },
                      { label: '🌙 Noche', value: 'night' as const },
                    ]}
                    value={values.sleepSchedule}
                    onChange={v => set('sleepSchedule', (v ?? '') as 'morning' | 'night' | '')}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500">Nivel de ruido</label>
                  <ChipGroup
                    options={[
                      { label: 'Bajo', value: 'low' as const },
                      { label: 'Medio', value: 'medium' as const },
                      { label: 'Alto', value: 'high' as const },
                    ]}
                    value={values.noiseLevel}
                    onChange={v => set('noiseLevel', (v ?? '') as 'low' | 'medium' | 'high' | '')}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500">Mascotas</label>
                  <ChipGroup
                    options={[
                      { label: '✅ Sí', value: 'yes' as never },
                      { label: '❌ No', value: 'no' as never },
                    ]}
                    value={values.petsAllowed === null ? '' : values.petsAllowed ? 'yes' : 'no'}
                    onChange={v =>
                      set('petsAllowed', v === null ? null : (v as string) === 'yes')
                    }
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500">Limpieza</label>
                  <ChipGroup
                    options={[
                      { label: 'Relajada', value: 'low' as const },
                      { label: 'Media', value: 'medium' as const },
                      { label: 'Alta', value: 'high' as const },
                    ]}
                    value={values.cleanliness}
                    onChange={v => set('cleanliness', (v ?? '') as 'low' | 'medium' | 'high' | '')}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500">Hábitos de estudio</label>
                  <ChipGroup
                    options={[
                      { label: 'Poco', value: 'rarely' as const },
                      { label: 'Regular', value: 'sometimes' as const },
                      { label: 'Intenso', value: 'often' as const },
                    ]}
                    value={values.studyHabits}
                    onChange={v =>
                      set('studyHabits', (v ?? '') as 'rarely' | 'sometimes' | 'often' | '')
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Section 4: Económicos ── */}
          <div>
            <SectionHeader
              title="Filtros económicos"
              open={openSections.economic}
              onToggle={() => toggleSection('economic')}
            />
            {openSections.economic && (
              <div className="grid grid-cols-1 gap-5 pb-5 sm:grid-cols-2">
                <div className="col-span-full flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500">Precio máximo</label>
                    <span className="text-xs font-semibold text-blue-600">
                      {values.maxPrice ? `S/ ${values.maxPrice}` : 'Sin límite'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={3000}
                    step={50}
                    value={values.maxPrice ?? 3000}
                    onChange={e => set('maxPrice', Number(e.target.value))}
                    className="h-2 w-full cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>S/ 100</span>
                    <span>S/ 3,000+</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500">División de gastos</label>
                  <ChipGroup
                    options={[
                      { label: 'Equitativo', value: 'equal' as const },
                      { label: 'Por habitación', value: 'per-room' as const },
                    ]}
                    value={values.expenseSplit}
                    onChange={v =>
                      set('expenseSplit', (v ?? '') as 'equal' | 'per-room' | '')
                    }
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500">Servicios incluidos</label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES.map(service => (
                      <label
                        key={service}
                        className={cn(
                          'flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                          values.includedServices.includes(service)
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 text-gray-600 hover:border-blue-400',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={values.includedServices.includes(service)}
                          onChange={() => toggleService(service)}
                          className="sr-only"
                        />
                        {service}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={handleReset}
            className="text-sm font-medium text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
          >
            Limpiar filtros
          </button>
          <Button size="lg" onClick={() => onApply(values)} className="px-8">
            Aplicar filtros
          </Button>
        </div>
      </div>
    </>
  )
}
