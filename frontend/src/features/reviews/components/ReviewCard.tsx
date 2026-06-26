import { Avatar } from '@/shared/components/ui/Avatar'
import { StarRating } from './StarRating'
import { formatDate } from '@/shared/utils/formatters'
import type { Review } from '../types/review.types'

interface ReviewCardProps {
  review: Review
}

export const ReviewCard = ({ review }: ReviewCardProps) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/50">
    <div className="mb-3 flex items-center gap-3">
      <Avatar src={review.reviewerAvatar} alt={review.reviewerFirstName} size="md" />
      <div>
        <p className="font-medium text-gray-900 dark:text-white">
          {review.reviewerFirstName} {review.reviewerLastName}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(review.createdAt)}</span>
        </div>
      </div>
    </div>
    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{review.comment}</p>
  </div>
)
