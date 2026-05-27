import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Building2, Calendar, Star, ArrowLeft } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

export const HostSidebar = () => {
  const links = [
    { to: '/host', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/host/properties', icon: Building2, label: 'Propiedades' },
    { to: '/host/reservations', icon: Calendar, label: 'Reservas' },
    { to: '/host/reviews', icon: Star, label: 'Reseñas' },
  ]

  return (
    <aside className="w-56 shrink-0">
      <nav className="flex flex-col gap-1">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100')
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
        <hr className="my-2 border-gray-100" />
        <NavLink
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Ver como huésped
        </NavLink>
      </nav>
    </aside>
  )
}
