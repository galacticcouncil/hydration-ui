import { create } from "zustand"

type Values = {
  readonly value: bigint | undefined
  readonly stakeValue: bigint | undefined
  readonly diffDays: string | undefined
}

type TIncreaseStakeStore = Values & {
  readonly update: <TKey extends keyof Values>(
    key: TKey,
    value: Values[TKey],
  ) => void
}

export const useIncreaseStake = create<TIncreaseStakeStore>()((set) => ({
  value: undefined,
  stakeValue: undefined,
  diffDays: undefined,
  update: (key, value) => set(() => ({ [key]: value })),
}))
