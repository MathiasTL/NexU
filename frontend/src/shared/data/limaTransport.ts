export interface TransportStop {
  id: string
  name: string
  type: 'metropolitano' | 'tren' | 'corredor'
  lat: number
  lng: number
}

export const LIMA_TRANSPORT_STOPS: TransportStop[] = [
  // Metropolitano — troncal
  { id: 'met-javier-prado',  name: 'Javier Prado',     type: 'metropolitano', lat: -12.0864, lng: -77.0428 },
  { id: 'met-angamos',       name: 'Angamos',           type: 'metropolitano', lat: -12.1100, lng: -77.0270 },
  { id: 'met-canada',        name: 'Canadá',            type: 'metropolitano', lat: -12.0935, lng: -77.0327 },
  { id: 'met-canaval',       name: 'Canaval y Moreyra', type: 'metropolitano', lat: -12.0985, lng: -77.0373 },
  { id: 'met-petit-thouars', name: 'Petit Thouars',     type: 'metropolitano', lat: -12.0820, lng: -77.0319 },
  // Tren Eléctrico — Línea 1
  { id: 'tren-la-cultura',   name: 'La Cultura',        type: 'tren',          lat: -12.0863, lng: -77.0006 },
  { id: 'tren-arriola',      name: 'Arriola',           type: 'tren',          lat: -12.0726, lng: -77.0106 },
  { id: 'tren-san-borja',    name: 'San Borja Sur',     type: 'tren',          lat: -12.1053, lng: -76.9986 },
  { id: 'tren-villa-maria',  name: 'Villa María',       type: 'tren',          lat: -12.1588, lng: -76.9648 },
  // Corredor Azul
  { id: 'cor-jockey-plaza',  name: 'Jockey Plaza',      type: 'corredor',      lat: -12.0888, lng: -76.9792 },
]

export const TRANSPORT_COLORS: Record<TransportStop['type'], string> = {
  metropolitano: '#DC2626',
  tren:          '#1A3C6E',
  corredor:      '#16A34A',
}

export const TRANSPORT_LABELS: Record<TransportStop['type'], string> = {
  metropolitano: 'Metropolitano',
  tren:          'Tren Eléctrico',
  corredor:      'Corredor',
}
