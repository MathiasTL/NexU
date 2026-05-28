import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

const Footer = () => (
  <footer className="border-t border-gray-100 bg-gray-50 py-8 mt-12">
    <div className="mx-auto max-w-7xl px-4">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center">
          <img src="/logo.png" alt="NexU" className="h-14 w-auto" />
        </div>
        <p className="text-sm text-gray-500">© 2026 NexU. Plataforma de alojamiento universitario en Perú.</p>
        <div className="flex gap-4 text-sm text-gray-500">
          <a href="#" className="hover:text-gray-700">Privacidad</a>
          <a href="#" className="hover:text-gray-700">Términos</a>
          <a href="#" className="hover:text-gray-700">Soporte</a>
        </div>
      </div>
    </div>
  </footer>
)

export const MainLayout = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
)
