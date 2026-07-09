import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Link } from 'react-router-dom'
import { formatCurrency } from '@/shared/utils/formatters'
import { LIMA_CENTER } from '@/shared/utils/constants'
import {
  UNIVERSITY_CAMPUSES,
  CAMPUS_CENTERS,
  campusPathOptions,
} from '@/shared/data/universityCampuses'
import {
  LIMA_TRANSPORT_STOPS,
  TRANSPORT_COLORS,
  TRANSPORT_LABELS,
} from '@/shared/data/limaTransport'
import type { CampusFeature } from '@/shared/data/universityCampuses'
import type { TransportStop } from '@/shared/data/limaTransport'
import type { Property, AvailabilityStatus } from '../types/property.types'

// ─── Tile ─────────────────────────────────────────────────────────────────────
const TILE_URL  = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// ─── Shared font stack ────────────────────────────────────────────────────────
const FONT = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif"

// ─── Property marker icons ────────────────────────────────────────────────────
const AVAILABILITY_COLORS: Record<AvailabilityStatus, string> = {
  available:   '#16A34A',
  reserved:    '#F59E0B',
  unavailable: '#DC2626',
}

const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  available:   'Disponible',
  reserved:    'Reservado',
  unavailable: 'No disponible',
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  room:      'Habitación',
  apartment: 'Depa',
  shared:    'Compartido',
  studio:    'Estudio',
}

const createPropertyIcon = (availability: AvailabilityStatus) =>
  L.divIcon({
    html: `<div style="
      width:20px;height:20px;border-radius:50%;
      background:${AVAILABILITY_COLORS[availability]};
      border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.35)">
    </div>`,
    className:   '',
    iconSize:    [20, 20],
    iconAnchor:  [10, 10],
    popupAnchor: [0, -14],
  })

// ─── University label icon ────────────────────────────────────────────────────
const createUniversityIcon = (abbr: string) =>
  L.divIcon({
    html: `<div style="
      position:absolute;
      transform:translate(-50%,-50%);
      background:#1A3C6E;
      color:white;
      font-size:10px;
      font-weight:600;
      font-family:${FONT};
      letter-spacing:.4px;
      padding:3px 8px;
      border-radius:5px;
      box-shadow:0 1px 5px rgba(0,0,0,0.30);
      white-space:nowrap;
      line-height:1.4;
      pointer-events:none;
    ">${abbr}</div>`,
    className:   '',
    iconSize:    [0, 0],
    iconAnchor:  [0, 0],
    popupAnchor: [0, -12],
  })

// ─── Transport stop icon ──────────────────────────────────────────────────────
const TRANSPORT_LETTER: Record<TransportStop['type'], string> = {
  metropolitano: 'M',
  tren:          'T',
  corredor:      'C',
}

const createTransportIcon = (type: TransportStop['type']) =>
  L.divIcon({
    className: '',
    html: `<div style="
      background:${TRANSPORT_COLORS[type]};
      color:white;
      border-radius:50%;
      width:20px;height:20px;
      display:flex;align-items:center;justify-content:center;
      font-size:10px;font-weight:700;font-family:${FONT};
      box-shadow:0 1px 3px rgba(0,0,0,.4);
    ">${TRANSPORT_LETTER[type]}</div>`,
    iconSize:   [0, 0],
    iconAnchor: [10, 10],
  })

// ─── GeoJSON style function ───────────────────────────────────────────────────
const featureStyle = (feature: CampusFeature | undefined) =>
  campusPathOptions(feature?.properties.status ?? 'approximate')

// ─── Component ────────────────────────────────────────────────────────────────

interface PropertySearchMapProps {
  properties: Property[]
}

export const PropertySearchMap = ({ properties }: PropertySearchMapProps) => {
  const [showUniversities, setShowUniversities] = useState(true)
  const [showTransport,    setShowTransport]    = useState(false)

  useEffect(() => {
    window.dispatchEvent(new Event('resize'))
  }, [])

  return (
    <div className="relative isolate h-full min-h-[500px]">
      <MapContainer
        center={[LIMA_CENTER.lat, LIMA_CENTER.lng]}
        zoom={LIMA_CENTER.zoom}
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
        zoomControl={false}
      >
        <TileLayer attribution={TILE_ATTR} url={TILE_URL} />

        {/* ── Property markers ─────────────────────────────────────────────── */}
        {properties.map(p => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={createPropertyIcon(p.availabilityStatus)}
          >
            <Popup minWidth={175}>
              <div style={{ fontFamily: FONT }} className="min-w-[175px]">
                <img
                  src={p.images[0]}
                  alt={p.title}
                  className="mb-2 h-24 w-full rounded object-cover"
                />
                <div className="mb-1 flex items-center gap-1">
                  <span
                    style={{ background: AVAILABILITY_COLORS[p.availabilityStatus] }}
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                  />
                  <span className="text-[11px] text-gray-500">
                    {AVAILABILITY_LABELS[p.availabilityStatus]}
                  </span>
                  <span className="ml-auto rounded-full bg-orange-50 px-1.5 py-0.5 text-[11px] font-semibold text-orange-600">
                    {ROOM_TYPE_LABELS[p.roomType]}
                  </span>
                </div>
                <p className="line-clamp-2 text-xs font-semibold leading-snug text-gray-900">
                  {p.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-gray-600">
                  {p.district} · {p.distanceToUniversityMinutes} min de {p.nearestUniversity}
                </p>
                <p className="mt-1.5 text-sm font-bold text-orange-600">
                  {formatCurrency(p.pricePerMonth)}
                  <span className="text-[11px] font-normal text-gray-500">/mes</span>
                </p>
                <Link
                  to={`/properties/${p.id}`}
                  className="mt-2 block rounded-lg bg-primary px-2 py-1.5 text-center text-[11px] font-semibold text-white hover:bg-primary-600"
                >
                  Ver espacio →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ── University campus polygons + labels ───────────────────────────── */}
        {showUniversities && (
          <>
            <GeoJSON
              key="campus-boundaries"
              data={UNIVERSITY_CAMPUSES as unknown as Parameters<typeof GeoJSON>[0]['data']}
              style={f => featureStyle(f as CampusFeature | undefined)}
            />
            {CAMPUS_CENTERS.map(campus => (
              <Marker
                key={campus.id}
                position={[campus.lat, campus.lng]}
                icon={createUniversityIcon(campus.abbr)}
                zIndexOffset={200}
              >
                <Popup>
                  <div style={{ fontFamily: FONT }}>
                    <p className="text-xs font-bold" style={{ color: '#1A3C6E' }}>
                      {campus.abbr}
                    </p>
                    <p className="text-[11px] text-gray-500">{campus.fullName}</p>
                    {campus.status === 'approximate' && (
                      <p className="mt-0.5 text-[10px] text-amber-500">
                        Perímetro aproximado
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}

        {/* ── Transport stops ───────────────────────────────────────────────── */}
        {showTransport && LIMA_TRANSPORT_STOPS.map(stop => (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={createTransportIcon(stop.type)}
            zIndexOffset={100}
          >
            <Popup>
              <div style={{ fontFamily: FONT }}>
                <p className="text-xs font-bold text-gray-900">{stop.name}</p>
                <p className="text-[11px]" style={{ color: TRANSPORT_COLORS[stop.type] }}>
                  {TRANSPORT_LABELS[stop.type]}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ── Controls overlay ─────────────────────────────────────────────────── */}
      <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2">
        {/* University toggle */}
        <button
          onClick={() => setShowUniversities(v => !v)}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium shadow-md transition-colors ${
            showUniversities
              ? 'bg-secondary text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
          style={{ color: showUniversities ? 'white' : undefined }}
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded border-2 border-secondary"
            style={{ background: showUniversities ? '#1A3C6E' : 'transparent' }}
          />
          Universidades
        </button>

        {/* Transport toggle */}
        <button
          onClick={() => setShowTransport(v => !v)}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium shadow-md transition-colors ${
            showTransport
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: showTransport ? 'white' : '#DC2626' }}
          />
          Transporte
        </button>

        {/* Legend */}
        <div className="rounded-xl bg-white px-3 py-2 shadow-md">
          <p className="mb-1 text-xs font-semibold text-gray-500">Disponibilidad</p>
          <div className="flex flex-col gap-0.5">
            {(Object.entries(AVAILABILITY_COLORS) as [AvailabilityStatus, string][]).map(
              ([status, color]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm"
                    style={{ background: color }}
                  />
                  <span className="text-xs text-gray-600">{AVAILABILITY_LABELS[status]}</span>
                </div>
              ),
            )}
          </div>
          {showTransport && (
            <>
              <p className="mb-1 mt-2 text-xs font-semibold text-gray-500">Transporte</p>
              <div className="flex flex-col gap-0.5">
                {(Object.entries(TRANSPORT_COLORS) as [TransportStop['type'], string][]).map(
                  ([type, color]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <span
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white"
                        style={{ background: color }}
                      >
                        {TRANSPORT_LETTER[type]}
                      </span>
                      <span className="text-xs text-gray-600">{TRANSPORT_LABELS[type]}</span>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
