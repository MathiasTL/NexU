export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-secondary-100 text-secondary-700',
  cancelled: 'bg-red-100 text-red-800',
}

export const PROPERTY_TYPES: {
  id: 'room' | 'apartment' | 'shared' | 'studio'
  label: string
  description: string
  emoji: string
}[] = [
  { id: 'room',      label: 'Habitación privada', description: 'Una habitación en una casa o departamento compartido', emoji: '🛏' },
  { id: 'shared',    label: 'Cuarto compartido',  description: 'Comparte el cuarto con otros estudiantes', emoji: '🤝' },
  { id: 'studio',    label: 'Estudio',            description: 'Espacio independiente con todo incluido', emoji: '🏠' },
  { id: 'apartment', label: 'Departamento',        description: 'Departamento completo para 1 o más personas', emoji: '🏢' },
]

export const LIMA_CENTER = { lat: -12.0464, lng: -77.0428, zoom: 12 }
