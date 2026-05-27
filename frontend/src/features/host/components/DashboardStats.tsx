import { TrendingUp, DollarSign, Star, Bookmark } from 'lucide-react'
import { formatCurrency } from '@/shared/utils/formatters'
import type { DashboardStats as Stats } from '../types/host.types'

interface DashboardStatsProps {
  stats: Stats
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const cards = [
    {
      label: 'Total reservas',
      value: stats.totalBookings.toString(),
      icon: Bookmark,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Ingresos totales',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Calificación promedio',
      value: stats.averageRating > 0 ? `${stats.averageRating} / 5` : '—',
      icon: Star,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Ticket promedio',
      value: stats.averageTicket > 0 ? formatCurrency(stats.averageTicket) : '—',
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(card => (
        <div key={card.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className={`mb-3 inline-flex rounded-xl p-2 ${card.color}`}>
            <card.icon className="h-5 w-5" />
          </div>
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className="text-xl font-bold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
