import { useEffect, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { useAuth } from '@/core/auth/useAuth'
import { accountService } from '../services/account.service'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { Button } from '@/shared/components/ui/Button'
import { formatDateTime } from '@/shared/utils/formatters'
import { cn } from '@/shared/utils/cn'
import type { Notification } from '@/mock/notifications.mock'

export const NotificationsPage = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    accountService.getNotifications(user.id).then(data => {
      setNotifications(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
      setLoading(false)
    })
  }, [user])

  const markRead = async (id: number) => {
    await accountService.markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read)
    await Promise.all(unread.map(n => accountService.markNotificationRead(n.id)))
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Notificaciones {unreadCount > 0 && <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-sm text-blue-700">{unreadCount}</span>}
        </h2>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" /> Marcar todas como leídas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-12 w-12" />}
          title="Sin notificaciones"
          description="Tus notificaciones aparecerán aquí."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={cn(
                'cursor-pointer rounded-2xl border p-4 transition-colors',
                n.read ? 'border-gray-100 bg-white' : 'border-blue-100 bg-blue-50'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={cn('font-medium', n.read ? 'text-gray-700' : 'text-blue-900')}>{n.title}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{n.message}</p>
                  <p className="mt-1 text-xs text-gray-400">{formatDateTime(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
