import { create } from "zustand"
import { persist } from "zustand/middleware"

type ReferralCodesState = {
  referralCodes: Record<string, string | undefined>
}

type ReferralCodesStore = ReferralCodesState & {
  setReferralCode: (
    referralCode: string | undefined,
    accountAddress: string,
  ) => void
}

const initialState: ReferralCodesState = {
  referralCodes: {},
}

export const useReferralCodesStore = create<ReferralCodesStore>()(
  persist(
    (set) => ({
      ...initialState,
      setReferralCode: (referralCode, accountAddress) =>
        set((state) => ({
          ...state,
          referralCodes: {
            ...state.referralCodes,
            [accountAddress]: referralCode,
          },
        })),
    }),
    {
      name: "referral-codes",
      version: 1,
    },
  ),
)
