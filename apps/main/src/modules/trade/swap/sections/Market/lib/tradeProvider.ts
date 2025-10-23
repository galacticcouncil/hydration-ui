import { Trade, TradeOrder } from "@galacticcouncil/sdk-next/build/types/sor"

import { HealthFactorResult } from "@/api/aave"
import { AnyTransaction } from "@/modules/transactions/types"

export type TradeProviderProps = {
  readonly swap: Trade | undefined
  readonly swapTx: AnyTransaction | null
  readonly twap: TradeOrder | undefined
  readonly twapTx: AnyTransaction | null
  readonly healthFactor: HealthFactorResult | undefined
  readonly isLoading: boolean
}
