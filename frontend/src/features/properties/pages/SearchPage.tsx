import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Map, List } from 'lucide-react'
import { propertyService } from '../services/property.service'
import { PropertyCard } from '../components/PropertyCard'
import { PropertySearchMap } from '../components/PropertySearchMap'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { LoadingSkeleton } from '@/shared/components/feedback/LoadingSkeleton'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { useDebounce } from '@/shared/hooks/useDebounce'
import type { Property } from '../types/property.types'

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [maxPrice, setMaxPrice] = useState('')
  const [minCapacity, setMinCapacity] = useState('')

  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    setLoading(true)
    propertyService.search({
      query: debouncedQuery || undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      capacity: minCapacity ? Number(minCapacity) : undefined,
    }).then(data => {
      setProperties(data)
      setLoading(false)
    })
  }, [debouncedQuery, maxPrice, minCapacity])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams(query ? { q: query } : {})
  }

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
              placeholder="Buscar por distrito o nombre..."
              className="flex-1"
            />
            <Button variant="outline" type="button" onClick={() => setShowFilters(v => !v)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <button
              type="button"
              onClick={() => setShowMap(v => !v)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 md:hidden"
            >
              {showMap ? <List className="h-4 w-4" /> : <Map className="h-4 w-4" />}
            </button>
          </form>

          {showFilters && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Input
                label="Precio máximo (S/)"
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="500"
              />
              <Input
                label="Mínimo huéspedes"
                type="number"
                value={minCapacity}
                onChange={e => setMinCapacity(e.target.value)}
                placeholder="2"
              />
            </div>
          )}

          <p className="mt-2 text-xs text-gray-500">
            {loading ? 'Buscando...' : `${properties.length} propiedades encontradas`}
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
              {properties.map(p => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className={`hidden flex-1 border-l border-gray-100 md:block ${showMap ? '' : 'hidden'}`}>
        <PropertySearchMap properties={properties} />
      </div>
    </div>
  )
}
