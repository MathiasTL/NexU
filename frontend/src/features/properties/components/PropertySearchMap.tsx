import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Link } from 'react-router-dom'
import { formatCurrency } from '@/shared/utils/formatters'
import { LIMA_CENTER } from '@/shared/utils/constants'
import type { Property, AvailabilityStatus } from '../types/property.types'

// ─── Custom icons ────────────────────────────────────────────────────────────

const AVAILABILITY_COLORS: Record<AvailabilityStatus, string> = {
  available: '#16A34A',
  reserved: '#F59E0B',
  unavailable: '#DC2626',
}

const createPropertyIcon = (availability: AvailabilityStatus) =>
  L.divIcon({
    html: `<div style="width:20px;height:20px;border-radius:50%;background:${AVAILABILITY_COLORS[availability]};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14],
  })

const createUniversityIcon = (abbr: string) =>
  L.divIcon({
    html: `<div style="background:#1A3C6E;color:white;font-size:9px;font-weight:700;padding:3px 7px;border-radius:6px;box-shadow:0 2px 5px rgba(0,0,0,0.35);white-space:nowrap;letter-spacing:.3px">${abbr}</div>`,
    className: '',
    iconAnchor: [20, 10],
    popupAnchor: [0, -14],
  })

// ─── University data ──────────────────────────────────────────────────────────

const UNIVERSITIES = [
  { abbr: 'PUCP',  lat: -12.0701, lng: -77.0794 },
  { abbr: 'UNI',   lat: -12.0212, lng: -77.0490 },
  { abbr: 'UNMSM', lat: -12.0541, lng: -77.0827 },
  { abbr: 'UPC',   lat: -12.1044, lng: -76.9784 },
  { abbr: 'UP',    lat: -12.0753, lng: -77.0555 },
  { abbr: 'ULIMA', lat: -12.0860, lng: -76.9450 },
  { abbr: 'UPCH',  lat: -12.0216, lng: -77.0537 },
  { abbr: 'USMP',  lat: -12.0284, lng: -77.0547 },
]

const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservado',
  unavailable: 'No disponible',
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  room: 'Habitación',
  apartment: 'Departamento',
  shared: 'Compartido',
  studio: 'Estudio',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PropertySearchMapProps {
  properties: Property[]
}

export const PropertySearchMap = ({ properties }: PropertySearchMapProps) => {
  const [showUniversities, setShowUniversities] = useState(true)

  useEffect(() => {
    window.dispatchEvent(new Event('resize'))
  }, [])

  return (
    <div className="relative h-full min-h-[500px]">
      <MapContainer
        center={[LIMA_CENTER.lat, LIMA_CENTER.lng]}
        zoom={LIMA_CENTER.zoom}
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Property markers */}
        {properties.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={createPropertyIcon(p.availabilityStatus)}>
            <Popup minWidth={170}>
              <div className="min-w-[170px]">
                <img
                  src={p.images[0]}
                  alt={p.title}
                  className="mb-2 h-24 w-full rounded object-cover"
                />
                <div className="flex items-center gap-1 mb-1">
                  <span
                    style={{ background: AVAILABILITY_COLORS[p.availabilityStatus] }}
                    className="inline-block h-2 w-2 rounded-full shrink-0"
                  />
                  <span className="text-xs text-gray-500">{AVAILABILITY_LABELS[p.availabilityStatus]}</span>
                  <span className="ml-auto rounded-full bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700">
                    {ROOM_TYPE_LABELS[p.roomType]}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 text-xs line-clamp-2 leading-snug">{p.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.district} · {p.distanceToUniversityMinutes} min de {p.nearestUniversity}</p>
                <p className="mt-1 font-bold text-orange-600 text-sm">{formatCurrency(p.pricePerMonth)}<span className="font-normal text-gray-400 text-xs">/mes</span></p>
                <Link
                  to={`/properties/${p.id}`}
                  className="mt-2 block rounded bg-orange-500 px-2 py-1 text-center text-xs text-white hover:bg-orange-600"
                >
                  Ver espacio
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* University markers */}
        {showUniversities && UNIVERSITIES.map(u => (
          <Marker key={u.abbr} position={[u.lat, u.lng]} icon={createUniversityIcon(u.abbr)}>
            <Popup>
              <p className="text-xs font-semibold text-secondary">{u.abbr}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2">
        {/* University toggle */}
        <button
          onClick={() => setShowUniversities(v => !v)}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium shadow-md transition-colors ${
            showUniversities
              ? 'bg-secondary text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="inline-block h-2.5 w-2.5 rounded bg-secondary" />
          Universidades
        </button>

        {/* Legend */}
        <div className="rounded-xl bg-white px-3 py-2 shadow-md">
          <p className="mb-1 text-xs font-semibold text-gray-500">Disponibilidad</p>
          <div className="flex flex-col gap-0.5">
            {(Object.entries(AVAILABILITY_COLORS) as [AvailabilityStatus, string][]).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm" style={{ background: color }} />
                <span className="text-xs text-gray-600">{AVAILABILITY_LABELS[status]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
