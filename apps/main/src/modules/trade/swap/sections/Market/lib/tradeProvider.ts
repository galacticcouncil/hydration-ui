import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"

export type TradeProviderProps = {
  children: (props: {
    swap: Trade | undefined
    isLoading: boolean
  }) => React.ReactNode
}
