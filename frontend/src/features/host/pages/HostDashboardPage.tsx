import { useEffect, useState } from 'react'
import { useAuth } from '@/core/auth/useAuth'
import { hostService } from '../services/host.service'
import { DashboardStats } from '../components/DashboardStats'
import { ActivityFeed } from '../components/ActivityFeed'
import { Spinner } from '@/shared/components/ui/Spinner'
import type { DashboardStats as Stats } from '../types/host.types'
import type { Booking } from '@/features/bookings/types/booking.types'

export const HostDashboardPage = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [activity, setActivity] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      hostService.getDashboardStats(user.id),
      hostService.getRecentActivity(user.id),
    ]).then(([s, a]) => {
      setStats(s)
      setActivity(a)
      setLoading(false)
    })
  }, [user])

  if (loading) return (
    <div className="flex justify-center py-20">
      <Spinner />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500">Bienvenido, {user?.firstName}. Aquí tienes un resumen de tu actividad.</p>
      </div>

      {stats && <DashboardStats stats={stats} />}

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <ActivityFeed bookings={activity} />
      </div>
    </div>
  )
}
