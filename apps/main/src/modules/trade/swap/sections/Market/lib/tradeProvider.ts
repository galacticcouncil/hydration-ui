import { HealthFactorResult } from "@galacticcouncil/money-market/utils"
import { DryRunError } from "@galacticcouncil/utils"

import { Trade, TradeOrder } from "@/api/trade"
import { AnyTransaction } from "@/modules/transactions/types"

export type TradeProviderProps = {
  readonly swap: Trade | undefined
  readonly swapTx: AnyTransaction | null
  readonly swapDryRunError: DryRunError | null
  readonly twap: TradeOrder | undefined
  readonly twapTx: AnyTransaction | null
  readonly twapDryRunError: DryRunError | null
  readonly healthFactor: HealthFactorResult | undefined
  readonly isSwapLoading: boolean
  readonly isTwapLoading: boolean
  readonly isHealthFactorLoading: boolean
}
