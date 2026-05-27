import { cn } from '@/shared/utils/cn'

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-lg bg-gray-200', className)} />
)

export const PropertyCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-gray-100">
    <Skeleton className="h-48 w-full rounded-none" />
    <div className="space-y-2 p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  </div>
)

export const LoadingSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => <PropertyCardSkeleton key={i} />)}
  </div>
)
