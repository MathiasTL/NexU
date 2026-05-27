import { create } from 'zustand';
export const useUIStore = create(set => ({
    isNavOpen: false,
    activeModal: null,
    setNavOpen: open => set({ isNavOpen: open }),
    setActiveModal: modal => set({ activeModal: modal }),
}));
