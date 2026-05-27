import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, MapPin } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { formatCurrency } from '@/shared/utils/formatters'
import type { Property } from '../types/property.types'

interface PropertyCardProps {
  property: Property
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const [liked, setLiked] = useState(false)

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link to={`/properties/${property.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img
            src={property.images[0]}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <button
            onClick={e => { e.preventDefault(); setLiked(v => !v) }}
            className="absolute right-3 top-3 rounded-full bg-white/80 p-1.5 backdrop-blur-sm hover:bg-white"
          >
            <Heart className={cn('h-4 w-4', liked ? 'fill-red-500 text-red-500' : 'text-gray-500')} />
          </button>
        </div>
        <div className="p-4">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{property.title}</h3>
          </div>
          <div className="mb-2 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            {property.district}, {property.city}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-900">{formatCurrency(property.pricePerNight)}</span>
              <span className="text-xs text-gray-500"> / noche</span>
            </div>
            {property.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-gray-700">{property.rating}</span>
                <span className="text-xs text-gray-400">({property.reviewsCount})</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
