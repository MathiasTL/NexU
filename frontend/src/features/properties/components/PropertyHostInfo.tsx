import { useEffect, useState } from 'react'
import { accountService } from '@/features/account/services/account.service'
import { Avatar } from '@/shared/components/ui/Avatar'
import { formatDate } from '@/shared/utils/formatters'
import type { PublicUser } from '@/features/account/types/account.types'

interface PropertyHostInfoProps {
  hostId: number
}

export const PropertyHostInfo = ({ hostId }: PropertyHostInfoProps) => {
  const [host, setHost] = useState<PublicUser | null>(null)

  useEffect(() => {
    accountService.getPublicProfile(hostId).then(setHost).catch(() => setHost(null))
  }, [hostId])

  if (!host) return null

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Sobre el propietario</h3>
      <div className="flex items-start gap-4">
        <Avatar src={host.avatarUrl} alt={host.firstName} size="lg" />
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{host.firstName} {host.lastName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Propietario desde {formatDate(host.createdAt)}</p>
          {host.bio && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{host.bio}</p>}
        </div>
      </div>
    </div>
  )
}
