import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { GraduationCap, X, ChevronDown } from 'lucide-react'
import { LIMA_UNIVERSITIES } from '@/shared/constants/universities'
import { cn } from '@/shared/utils/cn'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Render sin borde propio para embeber dentro de un contenedor padre */
  embedded?: boolean
  className?: string
}

interface DropdownPos {
  top: number
  left: number
  width: number
}

export const UniversityCombobox = ({
  value,
  onChange,
  placeholder = 'Universidad...',
  embedded = false,
  className,
}: Props) => {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [pos, setPos] = useState<DropdownPos | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setInputValue(value) }, [value])

  const updatePos = useCallback(() => {
    if (wrapperRef.current) {
      const r = wrapperRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
  }, [])

  useEffect(() => {
    if (open) updatePos()
  }, [open, updatePos])

  useEffect(() => {
    const onScroll = () => open && updatePos()
    const onResize = () => open && updatePos()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open, updatePos])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = inputValue
    ? LIMA_UNIVERSITIES.filter(u => u.toLowerCase().includes(inputValue.toLowerCase()))
    : [...LIMA_UNIVERSITIES]

  const handleInput = (v: string) => {
    setInputValue(v)
    onChange(v)
    setOpen(true)
  }

  const handleSelect = (u: string) => {
    setInputValue(u)
    onChange(u)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setInputValue('')
    onChange('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const dropdown = open && filtered.length > 0 && pos
    ? createPortal(
        <div
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
          className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl"
        >
          <div className="px-3 pb-1 pt-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Universidades en Lima
            </p>
          </div>
          <ul className="pb-1.5">
            {filtered.map(u => (
              <li key={u}>
                <button
                  type="button"
                  onMouseDown={() => handleSelect(u)}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
                    inputValue === u
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50',
                  )}
                >
                  <span className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                    inputValue === u
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-500',
                  )}>
                    {u[0]}
                  </span>
                  <span className="font-medium">{u}</span>
                  {inputValue === u && (
                    <span className="ml-auto text-xs text-blue-400">✓</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>,
        document.body,
      )
    : null

  if (embedded) {
    return (
      <div ref={wrapperRef} className={cn('relative flex items-center gap-2', className)}>
        <GraduationCap className="h-4 w-4 shrink-0 text-blue-500" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
        {inputValue
          ? (
            <button type="button" onMouseDown={handleClear} className="shrink-0 text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )
          : (
            <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform', open && 'rotate-180')} />
          )}
        {dropdown}
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <div
        onClick={() => { setOpen(v => !v); inputRef.current?.focus() }}
        className={cn(
          'flex cursor-text items-center gap-2 rounded-xl border bg-white px-3 py-2.5 transition-colors',
          open
            ? 'border-blue-500 ring-2 ring-blue-500/20'
            : 'border-gray-300 hover:border-gray-400',
        )}
      >
        <GraduationCap className={cn('h-4 w-4 shrink-0 transition-colors', open ? 'text-blue-500' : 'text-gray-400')} />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
        {inputValue
          ? (
            <button type="button" onMouseDown={handleClear} className="shrink-0 text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )
          : (
            <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform', open && 'rotate-180')} />
          )}
      </div>
      {dropdown}
    </div>
  )
}
