import { useRef } from 'react'
import { Camera, X, ImagePlus } from 'lucide-react'
import { StepHeader } from '@/shared/components/ui/StepHeader'
import { WizardNav } from './WizardNav'
import type { CreatePropertyDraft } from '../types/host.types'

interface StepProps {
  draft: CreatePropertyDraft
  update: (partial: Partial<CreatePropertyDraft>) => void
  onNext: () => void
  onPrev: () => void
}

export const Step5Photos = ({ draft, update, onNext, onPrev }: StepProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const images = draft.images ?? []

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const newUrls = Array.from(files).map((file) => URL.createObjectURL(file))
    update({ images: [...images, ...newUrls] })
  }

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index)
    update({ images: updated })
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div>
      <StepHeader
        current={5}
        total={9}
        title="Añade fotos de tu propiedad"
        subtitle="Las fotos son clave para atraer huéspedes."
      />

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        // Reset value so the same file can be re-added after removal
        onClick={(e) => ((e.target as HTMLInputElement).value = '')}
      />

      {/* Upload area — shown always so the user can add more photos */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Seleccionar fotos"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 py-10 transition-colors hover:border-primary hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <div className="rounded-full bg-gray-100 p-4">
          {images.length === 0 ? (
            <Camera className="h-8 w-8 text-gray-400" />
          ) : (
            <ImagePlus className="h-8 w-8 text-primary" />
          )}
        </div>
        <div className="text-center">
          {images.length === 0 ? (
            <>
              <p className="font-medium text-gray-900">Sube tus fotos aquí</p>
              <p className="mt-1 text-sm text-gray-500">
                Haz clic o arrastra imágenes a esta área
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-gray-900">Añadir más fotos</p>
              <p className="mt-1 text-sm text-gray-500">
                {images.length} {images.length === 1 ? 'foto seleccionada' : 'fotos seleccionadas'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Thumbnail grid */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((url, index) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200"
            >
              <img
                src={url}
                alt={`Foto ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                aria-label={`Eliminar foto ${index + 1}`}
                onClick={() => handleRemove(index)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <WizardNav
        onPrev={onPrev}
        onNext={onNext}
        nextLabel={images.length === 0 ? 'Continuar sin fotos' : 'Continuar'}
      />
    </div>
  )
}
