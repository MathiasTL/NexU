import { useEffect, useState } from 'react'
import { USERS_MOCK } from '@/mock/users.mock'
import { Avatar } from '@/shared/components/ui/Avatar'
import { formatDate } from '@/shared/utils/formatters'
import type { User } from '@/mock/users.mock'

interface PropertyHostInfoProps {
  hostId: number
}

export const PropertyHostInfo = ({ hostId }: PropertyHostInfoProps) => {
  const [host, setHost] = useState<User | null>(null)

  useEffect(() => {
    const found = USERS_MOCK.find(u => u.id === hostId) ?? null
    setHost(found)
  }, [hostId])

  if (!host) return null

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <h3 className="mb-3 font-semibold text-gray-900">Sobre el anfitrión</h3>
      <div className="flex items-start gap-4">
        <Avatar src={host.avatarUrl} alt={host.firstName} size="lg" />
        <div>
          <p className="font-semibold text-gray-900">{host.firstName} {host.lastName}</p>
          <p className="text-xs text-gray-500">Anfitrión desde {formatDate(host.createdAt)}</p>
          {host.bio && <p className="mt-2 text-sm text-gray-600">{host.bio}</p>}
        </div>
      </div>
    </div>
  )
}
