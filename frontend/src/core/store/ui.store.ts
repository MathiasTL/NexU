import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  isNavOpen: boolean
  activeModal: string | null
  darkMode: boolean
  setNavOpen: (open: boolean) => void
  setActiveModal: (modal: string | null) => void
  toggleDarkMode: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isNavOpen:  false,
      activeModal: null,
      darkMode:   false,
      setNavOpen:    (open)  => set({ isNavOpen: open }),
      setActiveModal: (modal) => set({ activeModal: modal }),
      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode
          document.documentElement.classList.toggle('dark', next)
          return { darkMode: next }
        }),
    }),
    {
      name: 'nextu_ui_v1',
      partialize: (state) => ({ darkMode: state.darkMode }),
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) document.documentElement.classList.add('dark')
      },
    },
  )
)
