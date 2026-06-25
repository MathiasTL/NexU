import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Home } from 'lucide-react'
import { useAuth } from '@/core/auth/useAuth'
import { Avatar } from '../ui/Avatar'

export const HostNavbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-secondary shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/host" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-white">N</span>
          </div>
          <span className="text-lg font-bold text-white">NexU</span>
          <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary-300">
            Propietario
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-secondary-200 transition-colors hover:bg-white/10"
          >
            <Home className="h-4 w-4" />
            Ver como estudiante
          </Link>

          {user && (
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
                  <div className="absolute right-0 top-12 z-20 w-48 rounded-xl border border-gray-100 bg-white py-1 shadow-xl">
                    <Link
                      to="/account/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Mi perfil
                    </Link>
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
          )}
        </div>
      </div>
    </header>
  )
}
