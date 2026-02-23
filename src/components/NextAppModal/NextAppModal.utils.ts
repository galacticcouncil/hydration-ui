import { create } from "zustand"
import { persist } from "zustand/middleware"

type NextAppModalStore = {
  isOpen: boolean
  onClose: () => void
}

export const useNextAppModalStore = create<NextAppModalStore>()(
  persist(
    (set) => ({
      isOpen: true,
      onClose: () => set({ isOpen: false }),
    }),
    {
      name: "next-app-modal",
      version: 0,
    },
  ),
)
