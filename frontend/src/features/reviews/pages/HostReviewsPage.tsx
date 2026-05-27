import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { useAuth } from '@/core/auth/useAuth'
import { reviewService } from '../services/review.service'
import { propertyService } from '@/features/properties/services/property.service'
import { ReviewCard } from '../components/ReviewCard'
import { ReviewStats } from '../components/ReviewStats'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import type { Review } from '../types/review.types'

export const HostReviewsPage = () => {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchReviews = async () => {
      const properties = await propertyService.getByHostId(user.id)
      const propertyIds = properties.map(p => p.id)
      const data = await reviewService.getByHostId(user.id, propertyIds)
      setReviews(data)
      setLoading(false)
    }
    fetchReviews()
  }, [user])

  if (loading) return (
    <div className="flex justify-center py-20">
      <Spinner />
    </div>
  )

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-gray-900">Reseñas de tus propiedades</h2>
      {reviews.length > 0 && (
        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6">
          <ReviewStats reviews={reviews} />
        </div>
      )}
      {reviews.length === 0 ? (
        <EmptyState
          icon={<Star className="h-12 w-12" />}
          title="Aún no tienes reseñas"
          description="Las reseñas de tus huéspedes aparecerán aquí una vez que completen su estadía."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}
