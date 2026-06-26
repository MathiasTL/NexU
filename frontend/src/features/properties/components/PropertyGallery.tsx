import { useState, useRef } from 'react'
import { cn } from '@/shared/utils/cn'

interface PropertyGalleryProps {
  images: string[]
  title: string
}

export const PropertyGallery = ({ images, title }: PropertyGalleryProps) => {
  const [active, setActive]         = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    setDragOffset(e.touches[0].clientX - touchStartX.current)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    setIsDragging(false)
    setDragOffset(0)
    touchStartX.current = null
    if (Math.abs(delta) < 40) return
    if (delta > 0) setActive(i => Math.min(i + 1, images.length - 1))
    else           setActive(i => Math.max(i - 1, 0))
  }

  return (
    <div className="overflow-hidden sm:rounded-2xl">
      <div
        className="relative h-72 overflow-hidden sm:h-80"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Tira horizontal de imágenes */}
        <div
          className={cn('flex h-full', !isDragging && 'transition-transform duration-300 ease-out')}
          style={{ transform: `translateX(calc(-${active * 100}% + ${dragOffset}px))` }}
        >
          {images.map((img, i) => (
            <div key={i} className="h-full w-full shrink-0">
              <img
                src={img}
                alt={`${title} - imagen ${i + 1}`}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Dots — solo móvil */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 sm:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn('h-2 rounded-full transition-all', i === active ? 'w-5 bg-white' : 'w-2 bg-white/60')}
                aria-label={`Imagen ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Miniaturas — solo sm+ */}
      {images.length > 1 && (
        <div className="mt-2 hidden gap-2 overflow-x-auto pb-1 sm:flex">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn('h-16 w-24 shrink-0 overflow-hidden rounded-xl transition-opacity', i === active ? 'ring-2 ring-primary opacity-100' : 'opacity-60 hover:opacity-80')}
            >
              <img src={img} alt={`miniatura ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
