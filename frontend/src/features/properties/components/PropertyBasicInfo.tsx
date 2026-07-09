import { Star, MapPin, Users, BedDouble, Bath, Clock, BadgeCheck, GraduationCap } from 'lucide-react'
import { formatCurrency } from '@/shared/utils/formatters'
import type { Property, RoomType, AvailabilityStatus } from '../types/property.types'

const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  room: 'Habitación',
  apartment: 'Departamento',
  shared: 'Compartido',
  studio: 'Estudio',
}

const AVAILABILITY_CONFIG: Record<AvailabilityStatus, { label: string; className: string }> = {
  available: { label: 'Disponible ahora', className: 'bg-green-100 text-green-700' },
  reserved:  { label: 'Reservado',        className: 'bg-amber-100 text-amber-700' },
  unavailable: { label: 'No disponible',  className: 'bg-red-100 text-red-600' },
}

interface PropertyBasicInfoProps {
  property: Property
}

export const PropertyBasicInfo = ({ property }: PropertyBasicInfoProps) => {
  const avail = AVAILABILITY_CONFIG[property.availabilityStatus]

  return (
    <div>
      {/* Badges row */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-600">
          {ROOM_TYPE_LABELS[property.roomType]}
        </span>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${avail.className}`}>
          {avail.label}
        </span>
        {property.verifiedHost && (
          <span className="flex items-center gap-1 rounded-full bg-secondary-50 px-3 py-1 text-sm font-medium text-secondary-600">
            <BadgeCheck className="h-3.5 w-3.5" />
            Propietario verificado
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{property.title}</h1>

      {/* Location + rating + university */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4 shrink-0" />
          {property.district}, {property.city}
        </span>
        <span className="flex items-center gap-1">
          <GraduationCap className="h-4 w-4 shrink-0" />
          {property.distanceToUniversityMinutes} min de {property.nearestUniversity}
        </span>
        {property.rating > 0 && (
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <strong className="text-gray-900 dark:text-white">{property.rating}</strong>
            <span className="text-gray-500 dark:text-gray-400">({property.reviewsCount} reseñas)</span>
          </span>
        )}
      </div>

      {/* Price highlight */}
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(property.pricePerMonth)}</span>
        <span className="text-gray-500 dark:text-gray-400">/ mes</span>
        {property.pricePerNight > 0 && (
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({formatCurrency(property.pricePerNight)}/noche referencial)</span>
        )}
      </div>

      {/* Stats grid — 2×2 en móvil, fila en sm+ */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { Icon: Users,     text: `${property.capacity} ${property.capacity === 1 ? 'persona' : 'personas'}` },
          { Icon: BedDouble, text: `${property.bedrooms} ${property.bedrooms === 1 ? 'hab.' : 'habs.'} · ${property.beds} ${property.beds === 1 ? 'cama' : 'camas'}` },
          { Icon: Bath,      text: `${property.bathrooms} ${property.bathrooms === 1 ? 'baño' : 'baños'}` },
          { Icon: Clock,     text: `Desde las ${property.checkinTime}` },
        ].map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <Icon className="h-4 w-4 shrink-0 text-primary" />
            <span className="leading-tight">{text}</span>
          </div>
        ))}
      </div>

      {/* Description */}
      <p className="leading-relaxed text-gray-600 dark:text-gray-400">{property.description}</p>
    </div>
  )
}
