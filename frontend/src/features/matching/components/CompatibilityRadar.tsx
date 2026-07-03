import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend,
} from 'recharts'

interface Props {
  dimensions: Record<string, number>
  compareDimensions?: Record<string, number>
  labelA?: string
  labelB?: string
}

const AXIS_LABEL: Record<string, string> = {
  universidad: 'Universidad', presupuesto: 'Presupuesto', ruido: 'Ruido',
  estudio: 'Estudio', mascotas: 'Mascotas', fumar: 'Fumar',
  sueño: 'Sueño', limpieza: 'Limpieza', invitados: 'Invitados',
}

export function CompatibilityRadar({
  dimensions,
  compareDimensions,
  labelA = 'Compatibilidad',
  labelB = 'Candidato',
}: Props) {
  const data = Object.keys(dimensions).map((key) => ({
    axis: AXIS_LABEL[key] ?? key,
    a: dimensions[key],
    b: compareDimensions ? (compareDimensions[key] ?? 0) : undefined,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar name={labelA} dataKey="a" stroke="#2563eb" fill="#2563eb" fillOpacity={0.35} />
        {compareDimensions && (
          <Radar name={labelB} dataKey="b" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
        )}
        {compareDimensions && <Legend />}
      </RadarChart>
    </ResponsiveContainer>
  )
}
