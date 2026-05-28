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
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/host" className="flex items-center gap-2">
          <img src="/logo.png" alt="NexU" className="h-16 w-auto" />
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Anfitrión</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
            <Home className="h-4 w-4" />
            Ver como huésped
          </Link>

          {user && (
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
                    <Link to="/account/profile" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Mi perfil
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
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
