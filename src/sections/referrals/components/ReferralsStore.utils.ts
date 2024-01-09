import { create } from "zustand"
import { persist } from "zustand/middleware"

type TReferralToastStore = {
  displayed: boolean
  reset: () => void
  display: () => void
}

export const useReferralToastStore = create(
  persist<TReferralToastStore>(
    (set) => ({
      displayed: false,
      reset: () =>
        set({
          displayed: false,
        }),
      display: () =>
        set({
          displayed: true,
        }),
    }),
    {
      name: "referral-toast",
      version: 0.1,
      getStorage: () => window.sessionStorage,
    },
  ),
)
