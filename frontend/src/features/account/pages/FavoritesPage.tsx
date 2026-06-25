import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useFavoritesStore } from '@/core/store/favorites.store'
import { propertyService } from '@/features/properties/services/property.service'
import { PropertyCard } from '@/features/properties/components/PropertyCard'
import { LoadingSkeleton } from '@/shared/components/feedback/LoadingSkeleton'
import type { Property } from '@/features/properties/types/property.types'

export const FavoritesPage = () => {
  const { ids } = useFavoritesStore()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    propertyService.getAll().then(all => {
      setProperties(all.filter(p => ids.includes(p.id)))
      setLoading(false)
    })
  }, [ids])

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">Favoritos</h1>

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Heart className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-700">Aún no tienes favoritos</p>
            <p className="mt-1 text-sm text-gray-500">
              Guarda los espacios que más te gusten para encontrarlos fácilmente.
            </p>
          </div>
          <Link
            to="/search"
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            Explorar espacios
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map(p => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  )
}
