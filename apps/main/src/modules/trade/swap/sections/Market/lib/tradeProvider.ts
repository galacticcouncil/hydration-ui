import { Trade, TradeOrder } from "@galacticcouncil/sdk-next/build/types/sor"

import { HealthFactorResult } from "@/api/aave"

export type TradeProviderProps = {
  children: (props: {
    swap: Trade | undefined
    twap: TradeOrder | undefined
    healthFactor: HealthFactorResult | undefined
    isLoading: boolean
  }) => React.ReactNode
}
