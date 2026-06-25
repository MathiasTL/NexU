import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Home, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/core/auth/useAuth'
import { useUIStore } from '@/core/store/ui.store'
import { Avatar } from '../ui/Avatar'

export const HostNavbar = () => {
  const { user, logout } = useAuth()
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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <Link to="/host" className="flex items-center gap-2.5">
          <img src="/Logo_NexU.png" alt="NexU" className="h-16 w-auto object-contain dark:brightness-110" />
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            Propietario
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-secondary transition-colors hover:text-primary dark:text-secondary-300 dark:hover:text-primary"
          >
            <Home className="h-4 w-4" />
            Ver como estudiante
          </Link>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
            className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-secondary transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-secondary-300 dark:hover:bg-gray-800"
              >
                <Avatar src={user.avatarUrl} alt={user.firstName} size="sm" />
                <span className="hidden text-sm font-medium md:block">{user.firstName}</span>
                <ChevronDown className="h-4 w-4 text-secondary/50 dark:text-secondary-400" />
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-12 z-20 w-48 rounded-xl border border-gray-100 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                    <Link
                      to="/account/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Mi perfil
                    </Link>
                    <hr className="my-1 border-gray-100 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="h-4 w-4" /> Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
