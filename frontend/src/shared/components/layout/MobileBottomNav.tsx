import { NavLink } from 'react-router-dom'
import { Home, Search, Sparkles, Heart, User } from 'lucide-react'
import { useAuth } from '@/core/auth/useAuth'
import { cn } from '@/shared/utils/cn'

const PUBLIC_LINKS = [
  { to: '/',               icon: Home,     label: 'Inicio' },
  { to: '/search',         icon: Search,   label: 'Explorar' },
  { to: '/recommendations',icon: Sparkles, label: 'Para ti' },
]

const AUTH_LINKS = [
  { to: '/account/favorites', icon: Heart, label: 'Guardados' },
  { to: '/account/profile',   icon: User,  label: 'Cuenta' },
]

export const MobileBottomNav = () => {
  const { isAuthenticated } = useAuth()

  const links = isAuthenticated
    ? [...PUBLIC_LINKS, ...AUTH_LINKS]
    : [...PUBLIC_LINKS, { to: '/login', icon: User, label: 'Acceder' }]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[900] border-t border-gray-100 bg-white md:hidden"
         style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex h-14 items-stretch">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
