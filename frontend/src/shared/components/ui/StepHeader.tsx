interface StepHeaderProps {
  current: number
  total: number
  title: string
  subtitle?: string
}

export const StepHeader = ({ current, total, title, subtitle }: StepHeaderProps) => (
  <div className="mb-6">
    <div className="mb-4 flex items-center gap-3">
      <span className="text-sm font-medium text-gray-500">Paso {current} de {total}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${(current / total) * 100}%` }} />
      </div>
    </div>
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    {subtitle && <p className="mt-1 text-gray-500">{subtitle}</p>}
  </div>
)
