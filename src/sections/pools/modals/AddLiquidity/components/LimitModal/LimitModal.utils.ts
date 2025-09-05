import { TradeConfigCursor } from "@galacticcouncil/apps"

export const useSwapLimit = () => {
  const swapLimit = TradeConfigCursor.deref().slippage

  const update = (value: string) => {
    TradeConfigCursor.resetIn(["slippage"], value)
  }

  return { swapLimit, update }
}
