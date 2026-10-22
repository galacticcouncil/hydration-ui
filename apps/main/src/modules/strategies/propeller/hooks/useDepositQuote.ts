import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { bestSellWithTxQuery } from "@/api/trade"
import { calculateSlippage } from "@/api/utils/slippage"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { isExactAmount } from "@/modules/strategies/propeller/utils/amount"
import { readSwapDeposit } from "@/modules/strategies/propeller/utils/deposit"
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
  const quotedTx = quote?.tx ?? null

  const prepared = useMemo(() => {
    if (!quotedTx || !swap) return null
    try {
      const { exact, depositAmount, tradeCall } = readSwapDeposit(
        quotedTx.decodedCall,
        {
          assetIn: deposit.assetId,
          collateralId: deposit.vault.assetId,
          quotedAmountIn: swap.amountIn,
        },
      )
      if (tradeCall === quotedTx.decodedCall)
        return { exact, depositAmount, tx: quotedTx }
      const { type: pallet, value } = tradeCall as {
        type: string
        value: { type: string; value: unknown }
      }
      // untyped rebuild of the same pallet call with the rewritten minimum
      const build = (
        rpc.papi.tx as unknown as Record<
          string,
          Record<string, (args: unknown) => typeof quotedTx> | undefined
        >
      )[pallet]?.[value.type]
      return build ? { exact, depositAmount, tx: build(value.value) } : null
    } catch {
      return null
    }
  }, [quotedTx, swap, deposit.assetId, deposit.vault.assetId, rpc.papi])

  const tx = prepared?.tx ?? null
  // without a wallet there is no tx to read the limit from
  const depositAmount = quotedTx
    ? prepared?.depositAmount
    : swap && swap.amountOut - calculateSlippage(swap.amountOut, slippage)

  return {
    isSwap,
    swap,
    tx,
    depositAmount,
    exact: prepared?.exact ?? false,
    isLoading: isSwap && !!amountIn && (!isSynced || isLoading),
    // a quote whose call can't be turned into a deposit is as good as none
    isError: isSwap && !!quotedAmount && (isError || (!!quotedTx && !prepared)),
  }
}
