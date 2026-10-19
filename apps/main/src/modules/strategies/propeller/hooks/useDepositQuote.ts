import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { bestSellWithTxQuery } from "@/api/trade"
import { calculateSlippage } from "@/api/utils/slippage"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { isExactAmount } from "@/modules/strategies/propeller/utils/amount"
import { readSellLimit } from "@/modules/strategies/propeller/utils/deposit"
import {
  isSwapDeposit,
  type PropellerDepositOption,
} from "@/modules/strategies/propeller/utils/depositOptions"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

export const useDepositQuote = (
  deposit: PropellerDepositOption,
  amountIn: string,
  decimals: number,
) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)
  const isSwap = isSwapDeposit(deposit)

  const [debouncedAmount, isSynced] = useDebouncedValue(amountIn)
  const quotedAmount =
    isSwap && isExactAmount(debouncedAmount, decimals) ? debouncedAmount : ""

  const { data, isLoading, isError } = useQuery(
    bestSellWithTxQuery(rpc, {
      assetIn: deposit.assetId,
      assetOut: deposit.vault.assetId,
      amountIn: quotedAmount,
      slippage,
      address: account?.address ?? "",
    }),
  )

  const quote = isSynced && quotedAmount ? data : undefined
  const swap = quote?.swap
  const tx = quote?.tx ?? null
  // without a wallet there is no tx to read the limit from
  const minAmountOut = tx
    ? readSellLimit(tx.decodedCall)?.minAmountOut
    : swap && swap.amountOut - calculateSlippage(swap.amountOut, slippage)

  return {
    isSwap,
    swap,
    tx,
    minAmountOut,
    isLoading: isSwap && !!amountIn && (!isSynced || isLoading),
    isError: isSwap && !!quotedAmount && isError,
  }
}
