import { create } from "zustand"

type TIncreaseStakeStore = {
  value: string | undefined
  stakeValue: string | undefined
  diffDays: string | undefined
  update: (
    key: "value" | "diffDays" | "stakeValue",
    value: string | undefined,
  ) => void
}

export const useIncreaseStake = create<TIncreaseStakeStore>()((set) => ({
  value: undefined,
  stakeValue: undefined,
  diffDays: undefined,
  update: (key, value) => set(() => ({ [key]: value })),
}))
