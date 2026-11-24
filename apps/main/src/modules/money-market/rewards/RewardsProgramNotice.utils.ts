import { type RewardsProgram } from "@/api/rewardsDistributor"

/** The values the program's notices are written with. */
export const getRewardsProgramNoticeValues = ({
  latest,
  maxHollarDebtUsd,
}: RewardsProgram) => ({
  // not `symbol`: the currency formatter would print the allowance in it
  reward: latest?.reward.symbol,
  assets: Object.keys(latest?.assets ?? {}).join(", "),
  value: maxHollarDebtUsd,
})
