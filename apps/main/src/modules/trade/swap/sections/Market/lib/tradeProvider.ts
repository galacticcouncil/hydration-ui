import { HealthFactorResult } from "@/api/aave"
import { Trade, TradeOrder } from "@/api/trade"

export type TradeProviderProps = {
  readonly swap: Trade | undefined
  readonly twap: TradeOrder | undefined
  readonly healthFactor: HealthFactorResult | undefined
  readonly isLoading: boolean
}
