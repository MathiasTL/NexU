/**
 * Campus boundaries for Lima universities.
 *
 * Geometry format: GeoJSON Polygon with coordinates in [lng, lat] order.
 * status: 'official'     → derived from authoritative cartographic source.
 *         'approximate'  → best-effort polygon; replace with official GeoJSON
 *                          when available without touching any other file.
 *
 * To add a university: push a new entry to UNIVERSITY_CAMPUSES.features.
 * To upgrade to official boundaries: change the geometry + set status:'official'.
 * No other file needs to change.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type CampusStatus = 'official' | 'approximate'

export interface CampusProperties {
  /** Unique stable identifier (lowercase, no accents). */
  id: string
  /** Short display abbreviation shown on the map badge. */
  abbr: string
  /** Full legal name. */
  fullName: string
  /** Whether coordinates are official or approximate. */
  status: CampusStatus
  /** [lat, lng] — center used for the label marker. */
  center: [number, number]
  /** Optional data provenance note. */
  source?: string
}

type Ring = [number, number][]  // [[lng, lat], ...]

export interface CampusFeature {
  type: 'Feature'
  properties: CampusProperties
  geometry: { type: 'Polygon'; coordinates: Ring[] }
}

export interface CampusCollection {
  type: 'FeatureCollection'
  features: CampusFeature[]
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export const UNIVERSITY_CAMPUSES: CampusCollection = {
  type: 'FeatureCollection',
  features: [

    // ── PUCP ─────────────────────────────────────────────────────────────────
    // Pontificia Universidad Católica del Perú — San Miguel
    // ~49 ha. Bounded by Av. Universitaria (E) and Av. Riva Agüero (S).
    {
      type: 'Feature',
      properties: {
        id: 'pucp',
        abbr: 'PUCP',
        fullName: 'Pontificia Universidad Católica del Perú',
        status: 'approximate',
        center: [-12.0702, -77.0803],
        source: 'Aproximación manual · reemplazar con OSM relation 1234567',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-77.0846, -12.0660],   // NW
          [-77.0772, -12.0650],   // N-E (irregular norte)
          [-77.0752, -12.0685],   // E (frente a Av. Universitaria)
          [-77.0760, -12.0740],   // SE
          [-77.0838, -12.0755],   // SW
          [-77.0852, -12.0710],   // W mid
          [-77.0846, -12.0660],   // close
        ]],
      },
    },

    // ── UNMSM ─────────────────────────────────────────────────────────────────
    // Universidad Nacional Mayor de San Marcos — Ciudad Universitaria, Lima
    // Campus muy grande ~300 ha.  Av. Venezuela (N), Av. Universitaria (E).
    {
      type: 'Feature',
      properties: {
        id: 'unmsm',
        abbr: 'UNMSM',
        fullName: 'Universidad Nacional Mayor de San Marcos',
        status: 'approximate',
        center: [-12.0540, -77.0821],
        source: 'Aproximación manual',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-77.0920, -12.0465],   // NW
          [-77.0720, -12.0458],   // NE
          [-77.0715, -12.0530],   // E upper
          [-77.0722, -12.0610],   // SE
          [-77.0810, -12.0622],   // S mid
          [-77.0920, -12.0615],   // SW
          [-77.0928, -12.0540],   // W mid
          [-77.0920, -12.0465],   // close
        ]],
      },
    },

    // ── UNI ──────────────────────────────────────────────────────────────────
    // Universidad Nacional de Ingeniería — Rímac
    // ~50 ha. Av. Túpac Amaru al oeste.
    {
      type: 'Feature',
      properties: {
        id: 'uni',
        abbr: 'UNI',
        fullName: 'Universidad Nacional de Ingeniería',
        status: 'approximate',
        center: [-12.0213, -77.0493],
        source: 'Aproximación manual',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-77.0558, -12.0157],   // NW
          [-77.0428, -12.0148],   // NE
          [-77.0420, -12.0198],   // E upper
          [-77.0425, -12.0260],   // SE
          [-77.0480, -12.0278],   // S mid
          [-77.0558, -12.0272],   // SW
          [-77.0565, -12.0215],   // W mid
          [-77.0558, -12.0157],   // close
        ]],
      },
    },

    // ── UPC ──────────────────────────────────────────────────────────────────
    // Universidad Peruana de Ciencias Aplicadas — campus principal La Molina
    // ~35 ha.
    {
      type: 'Feature',
      properties: {
        id: 'upc',
        abbr: 'UPC',
        fullName: 'Universidad Peruana de Ciencias Aplicadas',
        status: 'approximate',
        center: [-12.1043, -76.9786],
        source: 'Aproximación manual',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-76.9840, -12.0985],   // NW
          [-76.9730, -12.0978],   // NE
          [-76.9722, -12.1040],   // E
          [-76.9732, -12.1100],   // SE
          [-76.9842, -12.1108],   // SW
          [-76.9850, -12.1042],   // W
          [-76.9840, -12.0985],   // close
        ]],
      },
    },

    // ── ULIMA ─────────────────────────────────────────────────────────────────
    // Universidad de Lima — La Molina / Surco, Av. Javier Prado Este 4600
    // ~43 ha.
    {
      type: 'Feature',
      properties: {
        id: 'ulima',
        abbr: 'ULIMA',
        fullName: 'Universidad de Lima',
        status: 'approximate',
        center: [-12.0861, -76.9454],
        source: 'Aproximación manual',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-76.9515, -12.0800],   // NW
          [-76.9390, -12.0795],   // NE
          [-76.9382, -12.0860],   // E
          [-76.9392, -12.0920],   // SE
          [-76.9518, -12.0927],   // SW
          [-76.9525, -12.0862],   // W
          [-76.9515, -12.0800],   // close
        ]],
      },
    },

    // ── UP ────────────────────────────────────────────────────────────────────
    // Universidad del Pacífico — Jesús María, Av. Salaverry 2020
    // Campus urbano pequeño ~4.5 ha.
    {
      type: 'Feature',
      properties: {
        id: 'up',
        abbr: 'UP',
        fullName: 'Universidad del Pacífico',
        status: 'approximate',
        center: [-12.0754, -77.0554],
        source: 'Aproximación manual',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-77.0582, -12.0730],   // NW
          [-77.0530, -12.0727],   // NE
          [-77.0526, -12.0778],   // SE
          [-77.0580, -12.0781],   // SW
          [-77.0582, -12.0730],   // close
        ]],
      },
    },

    // ── USIL ──────────────────────────────────────────────────────────────────
    // Universidad San Ignacio de Loyola — La Fontana 550, La Molina
    // ~20 ha.
    {
      type: 'Feature',
      properties: {
        id: 'usil',
        abbr: 'USIL',
        fullName: 'Universidad San Ignacio de Loyola',
        status: 'approximate',
        center: [-12.0868, -76.9720],
        source: 'Aproximación manual',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-76.9766, -12.0823],   // NW
          [-76.9672, -12.0818],   // NE
          [-76.9665, -12.0868],   // E
          [-76.9674, -12.0912],   // SE
          [-76.9770, -12.0917],   // SW
          [-76.9774, -12.0870],   // W
          [-76.9766, -12.0823],   // close
        ]],
      },
    },

    // ── UNFV ──────────────────────────────────────────────────────────────────
    // Universidad Nacional Federico Villarreal — San Miguel (sede principal)
    // Nota: UNFV tiene sedes dispersas; este polígono representa la sede central.
    // ~10 ha de área central administrativa.
    {
      type: 'Feature',
      properties: {
        id: 'unfv',
        abbr: 'UNFV',
        fullName: 'Universidad Nacional Federico Villarreal',
        status: 'approximate',
        center: [-12.0841, -77.0628],
        source: 'Aproximación manual — sede central San Miguel',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-77.0670, -12.0800],   // NW
          [-77.0582, -12.0796],   // NE
          [-77.0578, -12.0845],   // E
          [-77.0586, -12.0882],   // SE
          [-77.0672, -12.0886],   // SW
          [-77.0678, -12.0843],   // W
          [-77.0670, -12.0800],   // close
        ]],
      },
    },

    // ── UNAC ──────────────────────────────────────────────────────────────────
    // Universidad Nacional del Callao — Bellavista, Callao
    // ~50 ha.
    {
      type: 'Feature',
      properties: {
        id: 'unac',
        abbr: 'UNAC',
        fullName: 'Universidad Nacional del Callao',
        status: 'approximate',
        center: [-12.0570, -77.1145],
        source: 'Aproximación manual',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-77.1210, -12.0512],   // NW
          [-77.1080, -12.0505],   // NE
          [-77.1072, -12.0568],   // E
          [-77.1082, -12.0628],   // SE
          [-77.1212, -12.0635],   // SW
          [-77.1218, -12.0570],   // W
          [-77.1210, -12.0512],   // close
        ]],
      },
    },

    // ── UPCH ──────────────────────────────────────────────────────────────────
    // Universidad Peruana Cayetano Heredia — Av. Honorio Delgado 430, SMP
    // ~25 ha. Campus de ciencias de la salud.
    {
      type: 'Feature',
      properties: {
        id: 'upch',
        abbr: 'UPCH',
        fullName: 'Universidad Peruana Cayetano Heredia',
        status: 'approximate',
        center: [-12.0214, -77.0523],
        source: 'Aproximación manual',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-77.0575, -12.0168],   // NW
          [-77.0470, -12.0162],   // NE
          [-77.0463, -12.0215],   // E
          [-77.0472, -12.0260],   // SE
          [-77.0578, -12.0266],   // SW
          [-77.0582, -12.0217],   // W
          [-77.0575, -12.0168],   // close
        ]],
      },
    },
  ],
}

// ─── Derived helpers (read-only) ──────────────────────────────────────────────

/** Flat list of campus center points for label markers. */
export const CAMPUS_CENTERS = UNIVERSITY_CAMPUSES.features.map(f => ({
  id:        f.properties.id,
  abbr:      f.properties.abbr,
  fullName:  f.properties.fullName,
  status:    f.properties.status,
  lat:       f.properties.center[0],
  lng:       f.properties.center[1],
}))

/** Path options for campus polygons. Dashed = approximate, solid = official. */
export const campusPathOptions = (status: CampusStatus) => ({
  color:       '#1A3C6E',
  weight:       2,
  opacity:      0.75,
  fillColor:   '#1A3C6E',
  fillOpacity:  0.07,
  dashArray:   status === 'approximate' ? '6 4' : undefined,
})
