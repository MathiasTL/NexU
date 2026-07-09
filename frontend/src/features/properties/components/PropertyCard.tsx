import { Link } from 'react-router-dom'
import { Heart, Star, MapPin, BadgeCheck, Clock } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { formatCurrency } from '@/shared/utils/formatters'
import { useFavoritesStore } from '@/core/store/favorites.store'
import type { Property, RoomType, AvailabilityStatus } from '../types/property.types'

const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  room:      'Habitación',
  apartment: 'Departamento',
  shared:    'Compartido',
  studio:    'Estudio',
}

const AVAILABILITY_CONFIG: Record<AvailabilityStatus, { label: string; className: string }> = {
  available:   { label: 'Disponible',    className: 'bg-green-100 text-green-700' },
  reserved:    { label: 'Reservado',     className: 'bg-amber-100 text-amber-700' },
  unavailable: { label: 'No disponible', className: 'bg-red-100 text-red-600' },
}

interface PropertyCardProps {
  property: Property
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const { toggle, isFavorite } = useFavoritesStore()
  const liked        = isFavorite(property.id)
  const availability = AVAILABILITY_CONFIG[property.availabilityStatus]

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <Link to={`/properties/${property.id}`} className="block">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={property.images[0]}
            alt={property.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Availability badge */}
          <span className={cn('absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium', availability.className)}>
            {availability.label}
          </span>
          {/* Favorite button */}
          <button
            aria-label={liked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            onClick={e => { e.preventDefault(); toggle(property.id) }}
            className="absolute right-3 top-3 rounded-full bg-white/85 p-1.5 shadow-sm backdrop-blur-sm transition-colors hover:bg-white dark:bg-gray-800/85 dark:hover:bg-gray-800"
          >
            <Heart className={cn('h-4 w-4 transition-colors', liked ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400')} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Type + verified badges */}
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-600 dark:bg-primary/10 dark:text-primary">
              {ROOM_TYPE_LABELS[property.roomType]}
            </span>
            {property.verifiedHost && (
              <span className="flex items-center gap-0.5 rounded-full bg-secondary-50 px-2 py-0.5 text-xs font-medium text-secondary-600 dark:bg-secondary/10 dark:text-secondary-300">
                <BadgeCheck className="h-3 w-3" />
                Verificado
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 dark:text-white">
            {property.title}
          </h3>

          {/* Location */}
          <div className="mb-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="h-3 w-3 shrink-0" />
            {property.district}
          </div>

          {/* University distance */}
          <div className="mb-3 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-3 w-3 shrink-0" />
            {property.distanceToUniversityMinutes} min de {property.nearestUniversity}
          </div>

          {/* Price + rating */}
          <div className="flex items-end justify-between">
            <div>
              <span className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(property.pricePerMonth)}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400"> / mes</span>
            </div>
            {property.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{property.rating}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">({property.reviewsCount})</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
