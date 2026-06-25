import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { MobileBottomNav } from './MobileBottomNav'

const Footer = () => (
  <footer className="hidden border-t border-gray-100 bg-secondary py-10 mt-12 md:block">
    <div className="mx-auto max-w-7xl px-4">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center">
          <img src="/Logo_NexU.png" alt="NexU" className="h-20 w-auto object-contain brightness-0 invert" />
        </div>
        <p className="text-sm text-secondary-200">© 2026 NexU. Plataforma de alojamiento universitario en Perú.</p>
        <div className="flex gap-5 text-sm text-secondary-300">
          <a href="#" className="transition-colors hover:text-primary">Privacidad</a>
          <a href="#" className="transition-colors hover:text-primary">Términos</a>
          <a href="#" className="transition-colors hover:text-primary">Soporte</a>
        </div>
      </div>
    </div>
  </footer>
)

export const MainLayout = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    {/* pb-16 en mobile para que el contenido no quede tapado por el bottom nav */}
    <main className="flex-1 pb-16 md:pb-0">
      <Outlet />
    </main>
    <Footer />
    <MobileBottomNav />
  </div>
)
