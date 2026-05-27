import { create } from 'zustand'

interface UIState {
  isNavOpen: boolean
  activeModal: string | null
  setNavOpen: (open: boolean) => void
  setActiveModal: (modal: string | null) => void
}

export const useUIStore = create<UIState>(set => ({
  isNavOpen: false,
  activeModal: null,
  setNavOpen: open => set({ isNavOpen: open }),
  setActiveModal: modal => set({ activeModal: modal }),
}))
