import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, User, LogOut, Heart, Calendar, Settings2, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/core/auth/useAuth'
import { useUIStore } from '@/core/store/ui.store'
import { Avatar } from '../ui/Avatar'

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useUIStore()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-2">

        {/* Logo */}
        <div className="flex flex-1">
          <Link to="/" className="flex items-center">
            <img src="/Logo_NexU.png" alt="NexU" className="h-16 w-auto object-contain dark:brightness-110" />
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-secondary transition-colors hover:text-primary dark:text-secondary-300 dark:hover:text-primary">
            Inicio
          </Link>
          <Link to="/search" className="text-sm font-medium text-secondary transition-colors hover:text-primary dark:text-secondary-300 dark:hover:text-primary">
            Explorar
          </Link>
          <Link to="/recommendations" className="text-sm font-medium text-secondary transition-colors hover:text-primary dark:text-secondary-300 dark:hover:text-primary">
            Recomendaciones
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
            className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-2 py-1.5 text-secondary transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-secondary-300 dark:hover:bg-gray-800 md:px-3 md:py-2"
              >
                <Avatar src={user.avatarUrl} alt={user.firstName} size="sm" />
                <span className="hidden text-sm font-medium md:block">{user.firstName}</span>
                <ChevronDown className="hidden h-4 w-4 text-secondary/50 dark:text-secondary-400 md:block" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-12 z-20 w-52 rounded-xl border border-gray-100 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                    <Link to="/account/profile" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                      <User className="h-4 w-4 text-gray-400 dark:text-gray-500" /> Mi perfil
                    </Link>
                    <Link to="/account/bookings" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                      <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" /> Mis reservas
                    </Link>
                    <Link to="/account/favorites" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                      <Heart className="h-4 w-4 text-gray-400 dark:text-gray-500" /> Favoritos
                    </Link>
                    <Link to="/account/preferences" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                      <Settings2 className="h-4 w-4 text-gray-400 dark:text-gray-500" /> Preferencias
                    </Link>
                    {(user.role === 'host' || user.role === 'both') && (
                      <Link to="/host" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary-50 dark:hover:bg-primary/10">
                        Panel de propietario
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100 dark:border-gray-700" />
                    <button onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <LogOut className="h-4 w-4" /> Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-primary dark:text-secondary-300 dark:hover:text-primary">
                Iniciar sesión
              </Link>
              <Link to="/register"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600">
                Registrarse
              </Link>
            </div>
          )}

          {/* Mobile: botón de acceso cuando no está autenticado */}
          {!isAuthenticated && (
            <Link to="/login"
              className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-600 md:hidden">
              Acceder
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
