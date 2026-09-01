import { create } from "zustand"
import { persist } from "zustand/middleware"

export const startPageOptions = ["dashboard", "trade"] as const

export type StartPage = (typeof startPageOptions)[number]

type AppSettingsStore = {
  startPage: StartPage
  setStartPage: (startPage: StartPage) => void
}

export const useAppSettingsStore = create<AppSettingsStore>()(
  persist(
    (set) => ({
      startPage: "dashboard",
      setStartPage: (startPage) => set({ startPage }),
    }),
    {
      name: "hdx-start-page-settings",
      version: 1,
    },
  ),
)
