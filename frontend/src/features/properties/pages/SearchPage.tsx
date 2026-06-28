import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Map, List } from 'lucide-react'
import { propertyService } from '../services/property.service'
import { PropertyCard } from '../components/PropertyCard'
import { PropertySearchMap } from '../components/PropertySearchMap'
import { AdvancedFilters, DEFAULT_FILTERS, type AdvancedFilterValues } from '../components/AdvancedFilters'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { LoadingSkeleton } from '@/shared/components/feedback/LoadingSkeleton'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { cn } from '@/shared/utils/cn'
import type { Property, RoomType } from '../types/property.types'

const ROOM_TYPES: { value: RoomType | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'room', label: 'Habitación' },
  { value: 'apartment', label: 'Departamento' },
  { value: 'shared', label: 'Compartido' },
  { value: 'studio', label: 'Estudio' },
]

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties,   setProperties]   = useState<Property[]>([])
  const [loading,      setLoading]       = useState(true)
  const [showMap,      setShowMap]       = useState(true)
  const [showAdvanced, setShowAdvanced]  = useState(false)

  const saved = (() => {
    try { return JSON.parse(localStorage.getItem('nextu_search_filters_v1') ?? 'null') }
    catch { return null }
  })()

  // URL params tienen precedencia sobre localStorage
  const [roomType,   setRoomType]   = useState<RoomType | ''>((searchParams.get('roomType') as RoomType | null) ?? saved?.roomType ?? '')
  const [advFilters, setAdvFilters] = useState<AdvancedFilterValues>(saved?.advFilters ?? DEFAULT_FILTERS)
  const [query,      setQuery]      = useState(searchParams.get('q') ?? saved?.query ?? '')
  const debouncedQuery              = useDebounce(query, 400)

  useEffect(() => {
    localStorage.setItem('nextu_search_filters_v1', JSON.stringify({ advFilters, roomType, query }))
  }, [advFilters, roomType, query])

  useEffect(() => {
    setLoading(true)
    propertyService.search({
      query:             debouncedQuery || undefined,
      roomType:          roomType || advFilters.housingType as RoomType || undefined,
      nearestUniversity: advFilters.nearUniversity || undefined,
      district:          advFilters.district || undefined,
      maxPricePerMonth:  advFilters.maxPrice ?? undefined,
      // filtros de convivencia mapeados desde AdvancedFilters
      petsAllowed:   advFilters.petsAllowed === true ? true : undefined,
      quietHours:    advFilters.noiseLevel === 'low' ? true : undefined,
      hasWorkspace:  advFilters.studyHabits === 'often' ? true : undefined,
    }).then(data => {
      setProperties(data)
      setLoading(false)
    })
  }, [debouncedQuery, roomType, advFilters])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams(prev => {
      if (query) prev.set('q', query); else prev.delete('q')
      return prev
    })
  }

  const handleRoomTypeChange = (value: RoomType | '') => {
    setRoomType(value)
    setSearchParams(prev => {
      if (value) prev.set('roomType', value); else prev.delete('roomType')
      return prev
    })
  }

  const handleApplyAdvanced = (values: AdvancedFilterValues) => {
    setAdvFilters(values)
    setShowAdvanced(false)
  }

  const activeFilterCount = [
    advFilters.nearUniversity,
    advFilters.district,
    advFilters.maxPrice,
    advFilters.housingType,
    advFilters.sleepSchedule,
    advFilters.noiseLevel,
    advFilters.studyHabits,
    advFilters.petsAllowed !== null && advFilters.petsAllowed !== undefined ? true : false,
  ].filter(Boolean).length

  return (
    <div className="fixed inset-x-0 bottom-12 top-[65px] flex overflow-hidden md:relative md:inset-auto md:h-[calc(100vh-65px)]">
      {/* Left panel */}
      <div className={cn('flex w-full flex-col md:overflow-y-auto md:transition-all md:duration-300 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', showMap ? 'md:w-[55%] lg:w-[50%]' : 'md:w-full')}>

        {/* Search bar */}
        <div className="shrink-0 border-b border-gray-100 bg-white px-4 pb-4 pt-6 dark:border-gray-800 dark:bg-gray-900 md:sticky md:top-0 md:z-10">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Universidad, distrito o tipo de alojamiento..."
              className="flex-1"
            />
            <Button variant="outline" type="button" onClick={() => setShowAdvanced(true)} className="relative">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <button
              type="button"
              onClick={() => setShowMap(v => !v)}
              className="hidden items-center gap-1.5 rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 md:flex"
            >
              {showMap ? <List className="h-4 w-4" /> : <Map className="h-4 w-4" />}
              {showMap ? 'Lista' : 'Mapa'}
            </button>
          </form>

          {/* Room type chips */}
          <div className="mt-3 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {ROOM_TYPES.map(rt => (
              <button key={rt.value} onClick={() => handleRoomTypeChange(rt.value)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-2 text-xs font-medium transition-colors',
                  roomType === rt.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                )}>
                {rt.label}
              </button>
            ))}
          </div>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {loading ? 'Buscando...' : `${properties.length} ${properties.length === 1 ? 'alojamiento encontrado' : 'alojamientos encontrados'}`}
            {activeFilterCount > 0 && <span className="ml-1 text-primary">· {activeFilterCount} filtro{activeFilterCount > 1 ? 's' : ''} activo{activeFilterCount > 1 ? 's' : ''}</span>}
          </p>
        </div>

        {/* Results */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:flex-none md:overflow-visible">
          {loading ? (
            <LoadingSkeleton count={4} />
          ) : properties.length === 0 ? (
            <EmptyState title="Sin resultados" description="Prueba con otros filtros o términos de búsqueda." />
          ) : (
            <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', !showMap && 'md:grid-cols-4')}>
              {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className={cn('hidden flex-1 border-l border-gray-100 dark:border-gray-800', showMap && 'md:block')}>
        <PropertySearchMap properties={properties} />
      </div>

      {/* Advanced Filters modal */}
      <AdvancedFilters
        isOpen={showAdvanced}
        onClose={() => setShowAdvanced(false)}
        onApply={handleApplyAdvanced}
        initialValues={advFilters}
      />
    </div>
  )
}
