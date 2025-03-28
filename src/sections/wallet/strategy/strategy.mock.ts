import { DepositData } from "sections/wallet/strategy/CurrentDeposit/CurrentDeposit"

const hasDeposit = true

export const GIGADOT_ASSET_ID = "10"
export const GIGADOT_DEPOSIT: DepositData | null = hasDeposit
  ? {
      depositBalance: "12",
      rewardsBalance: "12",
    }
  : null
