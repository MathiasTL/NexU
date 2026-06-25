export const LIMA_UNIVERSITIES = [
  'PUCP',
  'UNI',
  'UNMSM',
  'UPC',
  'ULIMA',
  'UP',
  'USIL',
  'UNFV',
  'UNAC',
  'UPCH',
  'USMP',
  'UCSUR',
  'UCAL',
  'UTP',
] as const

export type LimaUniversity = typeof LIMA_UNIVERSITIES[number]
