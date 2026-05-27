import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, User, LogOut, Heart, Calendar } from 'lucide-react'
import { useAuth } from '@/core/auth/useAuth'
import { Avatar } from '../ui/Avatar'
import { cn } from '@/shared/utils/cn'

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-sm font-bold text-white">N</span>
          </div>
          <span className="text-lg font-bold text-gray-900">NexU</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">Inicio</Link>
          <Link to="/search" className="text-sm font-medium text-gray-600 hover:text-gray-900">Explorar</Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 hover:bg-gray-50"
              >
                <Avatar src={user.avatarUrl} alt={user.firstName} size="sm" />
                <span className="hidden text-sm font-medium text-gray-700 md:block">{user.firstName}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-12 z-20 w-48 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                    <Link to="/account/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="h-4 w-4" /> Mi perfil
                    </Link>
                    <Link to="/account/bookings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Calendar className="h-4 w-4" /> Mis reservas
                    </Link>
                    <Link to="/account/favorites" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Heart className="h-4 w-4" /> Favoritos
                    </Link>
                    {(user.role === 'host' || user.role === 'both') && (
                      <Link to="/host" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50">
                        Panel de anfitrión
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" /> Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                Iniciar sesión
              </Link>
              <Link to="/register" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Registrarse
              </Link>
            </div>
          )}

          <button
            onClick={() => setMenuOpen(v => !v)}
            className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={cn('border-t border-gray-100 bg-white px-4 py-3 md:hidden')}>
          <nav className="flex flex-col gap-3">
            <Link to="/" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700">Inicio</Link>
            <Link to="/search" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700">Explorar</Link>
            {!isAuthenticated && (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700">Iniciar sesión</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-blue-600">Registrarse</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
