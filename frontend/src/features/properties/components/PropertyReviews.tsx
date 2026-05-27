import { useEffect, useState } from 'react'
import { reviewService } from '@/features/reviews/services/review.service'
import { ReviewCard } from '@/features/reviews/components/ReviewCard'
import { ReviewStats } from '@/features/reviews/components/ReviewStats'
import { Spinner } from '@/shared/components/ui/Spinner'
import type { Review } from '@/features/reviews/types/review.types'

interface PropertyReviewsProps {
  propertyId: number
}

export const PropertyReviews = ({ propertyId }: PropertyReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reviewService.getByPropertyId(propertyId).then(data => {
      setReviews(data)
      setLoading(false)
    })
  }, [propertyId])

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>
  if (!reviews.length) return null

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Reseñas</h2>
      <div className="mb-6">
        <ReviewStats reviews={reviews} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}
