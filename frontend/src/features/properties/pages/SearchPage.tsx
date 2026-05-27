import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Map, List, Search } from 'lucide-react'
import { propertyService } from '../services/property.service'
import { PropertyCard } from '../components/PropertyCard'
import { PropertySearchMap } from '../components/PropertySearchMap'
import {
  AdvancedFilters,
  type AdvancedFilterValues,
  DEFAULT_FILTERS,
} from '../components/AdvancedFilters'
import { Input } from '@/shared/components/ui/Input'
import { LoadingSkeleton } from '@/shared/components/feedback/LoadingSkeleton'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { cn } from '@/shared/utils/cn'
import type { Property } from '../types/property.types'

const QUICK_FILTERS = ['Todos', 'Individual', 'Compartido', 'Roommates', 'Pet Friendly'] as const

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeQuick, setActiveQuick] = useState<string>('Todos')
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterValues>(DEFAULT_FILTERS)

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    setLoading(true)
    const maxPrice = searchParams.get('maxPrice')
    propertyService
      .search({
        query: debouncedQuery || undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      })
      .then(data => {
        setProperties(data)
        setLoading(false)
      })
  }, [debouncedQuery, searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams(query ? { q: query } : {})
  }

  const handleApplyAdvanced = (values: AdvancedFilterValues) => {
    setAdvancedFilters(values)
    setShowAdvanced(false)
  }

  return (
    <>
      <div className="flex h-[calc(100vh-65px)] overflow-hidden">
        {/* ── Left panel ── */}
        <div className="flex w-full flex-col overflow-y-auto md:w-[55%] lg:w-[50%]">
          {/* Search + chips */}
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-white">
            {/* Search row */}
            <div className="flex items-center gap-2 p-4">
              <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Buscar por distrito o universidad..."
                    className="pl-9"
                  />
                </div>
              </form>

              {/* Advanced filters button */}
              <button
                type="button"
                onClick={() => setShowAdvanced(true)}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                  showAdvanced
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50',
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
              </button>

              {/* Map toggle (mobile) */}
              <button
                type="button"
                onClick={() => setShowMap(v => !v)}
                className="rounded-xl border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 md:hidden"
                aria-label="Alternar mapa"
              >
                {showMap ? <List className="h-4 w-4" /> : <Map className="h-4 w-4" />}
              </button>
            </div>

            {/* Quick filter chips */}
            <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
              {QUICK_FILTERS.map(filter => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveQuick(filter)}
                  className={cn(
                    'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                    activeQuick === filter
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-blue-400',
                  )}
                >
                  {filter}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowAdvanced(true)}
                className="shrink-0 rounded-full border border-gray-300 px-3.5 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-400"
              >
                Filtros ⚙️
              </button>
            </div>
          </div>

          {/* Results count */}
          <p className="px-4 py-2 text-xs text-gray-500">
            {loading ? 'Buscando...' : `${properties.length} propiedades encontradas`}
          </p>

          {/* Results grid */}
          <div className="px-4 pb-4">
            {loading ? (
              <LoadingSkeleton count={4} />
            ) : properties.length === 0 ? (
              <EmptyState
                title="Sin resultados"
                description="Prueba con otros filtros o términos de búsqueda."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {properties.map(p => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Map panel ── */}
        <div
          className={cn(
            'flex-1 border-l border-gray-100',
            showMap ? 'hidden md:block' : 'hidden',
          )}
        >
          <PropertySearchMap properties={properties} />
        </div>
      </div>

      {/* ── Advanced filters modal ── */}
      <AdvancedFilters
        isOpen={showAdvanced}
        onClose={() => setShowAdvanced(false)}
        onApply={handleApplyAdvanced}
        initialValues={advancedFilters}
      />
    </>
  )
}
