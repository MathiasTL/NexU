import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, User, LogOut, Heart, Calendar } from 'lucide-react'
import { useAuth } from '@/core/auth/useAuth'
import { Avatar } from '../ui/Avatar'

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
    <header className="sticky top-0 z-40 bg-secondary shadow-md">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
        {/* Logo — ocupa flex-1 para equilibrar el lado derecho */}
        <div className="flex flex-1">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-white">N</span>
            </div>
            <span className="text-lg font-bold text-white">NexU</span>
          </Link>
        </div>

        {/* Desktop nav — centrado exacto */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-secondary-200 transition-colors hover:text-primary">
            Inicio
          </Link>
          <Link to="/search" className="text-sm font-medium text-secondary-200 transition-colors hover:text-primary">
            Explorar
          </Link>
          <Link to="/recommendations" className="text-sm font-medium text-secondary-200 transition-colors hover:text-primary">
            Recomendaciones
          </Link>
        </nav>

        {/* Right side — flex-1 justify-end para equilibrar */}
        <div className="flex flex-1 items-center justify-end gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-white transition-colors hover:bg-white/10"
              >
                <Avatar src={user.avatarUrl} alt={user.firstName} size="sm" />
                <span className="hidden text-sm font-medium md:block">{user.firstName}</span>
                <ChevronDown className="h-4 w-4 text-white/60" />
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-12 z-20 w-52 rounded-xl border border-gray-100 bg-white py-1 shadow-xl">
                    <Link
                      to="/account/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4 text-gray-400" /> Mi perfil
                    </Link>
                    <Link
                      to="/account/bookings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Calendar className="h-4 w-4 text-gray-400" /> Mis reservas
                    </Link>
                    <Link
                      to="/account/favorites"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Heart className="h-4 w-4 text-gray-400" /> Favoritos
                    </Link>
                    {(user.role === 'host' || user.role === 'both') && (
                      <Link
                        to="/host"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary-50"
                      >
                        Panel de propietario
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
              >
                Registrarse
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="rounded-lg p-2 text-white hover:bg-white/10 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-secondary-700 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-secondary-100 hover:bg-white/10"
            >
              Inicio
            </Link>
            <Link
              to="/search"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-secondary-100 hover:bg-white/10"
            >
              Explorar
            </Link>
            {!isAuthenticated && (
              <>
                <hr className="my-2 border-white/10" />
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-secondary-100 hover:bg-white/10"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-600"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
