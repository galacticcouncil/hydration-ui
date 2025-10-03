import { Trade, TradeOrder } from "@galacticcouncil/sdk-next/build/types/sor"

import { HealthFactorResult } from "@/api/aave"

export type TradeProviderProps = {
  readonly swap: Trade | undefined
  readonly twap: TradeOrder | undefined
  readonly healthFactor: HealthFactorResult | undefined
  readonly isLoading: boolean
}
