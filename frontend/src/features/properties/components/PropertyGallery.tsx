import { useState } from 'react'
import { cn } from '@/shared/utils/cn'

interface PropertyGalleryProps {
  images: string[]
  title: string
}

export const PropertyGallery = ({ images, title }: PropertyGalleryProps) => {
  const [active, setActive] = useState(0)

  return (
    <div className="overflow-hidden rounded-2xl">
      <div className="relative h-80 overflow-hidden">
        <img
          src={images[active]}
          alt={`${title} - imagen ${active + 1}`}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn('h-16 w-24 shrink-0 overflow-hidden rounded-xl transition-opacity', i === active ? 'ring-2 ring-blue-500 opacity-100' : 'opacity-60 hover:opacity-80')}
            >
              <img src={img} alt={`miniatura ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
