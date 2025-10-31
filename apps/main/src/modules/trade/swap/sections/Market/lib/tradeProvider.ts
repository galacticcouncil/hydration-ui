import { HealthFactorResult } from "@/api/aave"
import { Trade, TradeOrder } from "@/api/trade"
import { AnyTransaction } from "@/modules/transactions/types"

export type TradeProviderProps = {
  readonly swap: Trade | undefined
  readonly swapTx: AnyTransaction | null
  readonly twap: TradeOrder | undefined
  readonly twapTx: AnyTransaction | null
  readonly healthFactor: HealthFactorResult | undefined
  readonly isLoading: boolean
}
