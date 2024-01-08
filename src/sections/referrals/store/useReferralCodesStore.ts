import { create } from "zustand"
import { persist } from "zustand/middleware"

type ReferralCodeState = {
  referralCodes: Record<string, string | undefined>
}

type ReferralCodeStore = ReferralCodeState & {
  setReferralCode: (
    referralCode: string | undefined,
    accountAddress: string,
  ) => void
}

const initialState: ReferralCodeState = {
  referralCodes: {},
}

export const useReferralCodesStore = create<ReferralCodeStore>()(
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
