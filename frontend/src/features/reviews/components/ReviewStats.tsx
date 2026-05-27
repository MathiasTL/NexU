import { Star } from 'lucide-react'
import type { Review } from '../types/review.types'

interface ReviewStatsProps {
  reviews: Review[]
}

export const ReviewStats = ({ reviews }: ReviewStatsProps) => {
  if (!reviews.length) return null

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100),
  }))

  return (
    <div className="flex gap-8">
      <div className="flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-gray-900">{avg.toFixed(1)}</span>
        <div className="mt-1 flex">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className={`h-4 w-4 ${i <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
          ))}
        </div>
        <span className="mt-1 text-sm text-gray-500">{reviews.length} reseñas</span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        {distribution.map(({ star, pct }) => (
          <div key={star} className="flex items-center gap-2">
            <span className="w-2 text-xs text-gray-500">{star}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-7 text-xs text-gray-400">{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
