import { HealthFactorResult } from "@galacticcouncil/money-market/utils"

import { Trade, TradeOrder } from "@/api/trade"

export type TradeProviderProps = {
  readonly swap: Trade | undefined
  readonly twap: TradeOrder | undefined
  readonly healthFactor: HealthFactorResult | undefined
  readonly isSwapLoading: boolean
  readonly isTwapLoading: boolean
  readonly isHealthFactorLoading: boolean
}
