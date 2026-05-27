import { Avatar } from '@/shared/components/ui/Avatar'
import { StarRating } from './StarRating'
import { formatDate } from '@/shared/utils/formatters'
import type { Review } from '../types/review.types'

interface ReviewCardProps {
  review: Review
}

export const ReviewCard = ({ review }: ReviewCardProps) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-4">
    <div className="mb-3 flex items-start justify-between">
      <div className="flex items-center gap-3">
        <Avatar src={review.reviewerAvatar} alt={review.reviewerFirstName} size="md" />
        <div>
          <p className="font-medium text-gray-900">{review.reviewerFirstName} {review.reviewerLastName}</p>
          <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
        </div>
      </div>
      <StarRating rating={review.rating} size="sm" />
    </div>
    <p className="text-sm leading-relaxed text-gray-600">{review.comment}</p>
  </div>
)
