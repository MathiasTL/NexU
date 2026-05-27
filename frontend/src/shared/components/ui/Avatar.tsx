import { cn } from '@/shared/utils/cn'

interface AvatarProps {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'h-8 w-8 text-sm', md: 'h-10 w-10 text-base', lg: 'h-14 w-14 text-xl' }

export const Avatar = ({ src, alt = '', size = 'md', className }: AvatarProps) => (
  src
    ? <img src={src} alt={alt} className={cn('rounded-full object-cover', sizes[size], className)} />
    : <div className={cn('flex items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700', sizes[size], className)}>{alt.charAt(0).toUpperCase()}</div>
)
