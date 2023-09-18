import { LINKS } from "utils/navigation"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type TWarningStore = {
  warnings: {
    staking: { visible?: boolean; visibility: (keyof typeof LINKS)[] }
  }
  setWarnings: (key: TWarningsType, isOpen: boolean) => void
}

export type TWarningsType = keyof TWarningStore["warnings"]

export const useWarningsStore = create(
  persist<TWarningStore>(
    (set) => ({
      warnings: {
        staking: { visible: undefined, visibility: ["staking"] },
      },
      setWarnings: (key, isOpen) =>
        set(({ warnings }) => ({
          warnings: {
            ...warnings,
            [key]: { ...warnings[key], visible: isOpen },
          },
        })),
    }),
    {
      name: "warnings",
      getStorage: () => window.sessionStorage,
    },
  ),
)
