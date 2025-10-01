import { Trade, TradeOrder } from "@galacticcouncil/sdk-next/build/types/sor"

export type TradeProviderProps = {
  children: (props: {
    swap: Trade | undefined
    twap: TradeOrder | undefined
    isLoading: boolean
  }) => React.ReactNode
}
