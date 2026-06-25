import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  ids: number[]
  toggle: (id: number) => void
  isFavorite: (id: number) => boolean
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set(state => ({
          ids: state.ids.includes(id)
            ? state.ids.filter(i => i !== id)
            : [...state.ids, id],
        })),
      isFavorite: (id) => get().ids.includes(id),
    }),
    { name: 'nextu_favorites_v1' }
  )
)
