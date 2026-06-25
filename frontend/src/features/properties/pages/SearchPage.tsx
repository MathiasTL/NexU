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
  const [roomType,     setRoomType]      = useState<RoomType | ''>('')
  const [advFilters,   setAdvFilters]    = useState<AdvancedFilterValues>(DEFAULT_FILTERS)

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const debouncedQuery    = useDebounce(query, 400)

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
    setSearchParams(query ? { q: query } : {})
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
    <div className="flex h-[calc(100vh-65px)] overflow-hidden">
      {/* Left panel */}
      <div className="flex w-full flex-col overflow-y-auto md:w-[55%] lg:w-[50%]">

        {/* Search bar */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white p-4">
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
            <button type="button" onClick={() => setShowMap(v => !v)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 md:hidden">
              {showMap ? <List className="h-4 w-4" /> : <Map className="h-4 w-4" />}
            </button>
          </form>

          {/* Room type chips */}
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {ROOM_TYPES.map(rt => (
              <button key={rt.value} onClick={() => setRoomType(rt.value)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  roomType === rt.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}>
                {rt.label}
              </button>
            ))}
          </div>

          <p className="mt-2 text-xs text-gray-500">
            {loading ? 'Buscando...' : `${properties.length} ${properties.length === 1 ? 'alojamiento encontrado' : 'alojamientos encontrados'}`}
            {activeFilterCount > 0 && <span className="ml-1 text-primary">· {activeFilterCount} filtro{activeFilterCount > 1 ? 's' : ''} activo{activeFilterCount > 1 ? 's' : ''}</span>}
          </p>
        </div>

        {/* Results */}
        <div className="p-4">
          {loading ? (
            <LoadingSkeleton count={4} />
          ) : properties.length === 0 ? (
            <EmptyState title="Sin resultados" description="Prueba con otros filtros o términos de búsqueda." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className={`hidden flex-1 border-l border-gray-100 md:block ${showMap ? '' : 'hidden'}`}>
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
