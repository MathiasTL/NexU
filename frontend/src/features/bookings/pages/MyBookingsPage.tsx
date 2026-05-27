import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import { useAuth } from '@/core/auth/useAuth'
import { bookingService } from '../services/booking.service'
import { BookingCard } from '../components/BookingCard'
import { BookingDetailModal } from '../components/BookingDetailModal'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import type { Booking, BookingStatus } from '../types/booking.types'

const TABS: { key: BookingStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'confirmed', label: 'Confirmadas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'completed', label: 'Completadas' },
  { key: 'cancelled', label: 'Canceladas' },
]

export const MyBookingsPage = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<BookingStatus | 'all'>('all')
  const [selected, setSelected] = useState<Booking | null>(null)

  useEffect(() => {
    if (!user) return
    bookingService.getByTenantId(user.id).then(data => {
      setBookings(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
      setLoading(false)
    })
  }, [user])

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab)

  if (loading) return (
    <div className="flex justify-center py-20">
      <Spinner />
    </div>
  )

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-gray-900">Mis reservas</h2>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title="No hay reservas aquí"
          description="Tus reservas aparecerán en esta sección."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(booking => (
            <BookingCard key={booking.id} booking={booking} onSelect={setSelected} />
          ))}
        </div>
      )}

      <BookingDetailModal
        booking={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
