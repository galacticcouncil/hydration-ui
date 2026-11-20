import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { formatUnits } from "viem"

import { useAccountBalances } from "@/api/balances"
import { bestSellWithTxQuery } from "@/api/trade"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useMinimumTradeAmount } from "@/modules/liquidity/components/RemoveLiquidity/RemoveMoneyMarketLiquidity.utils"
import { useVaultEvmCall } from "@/modules/strategies/bil/hooks/useVaultWrites"
import {
  MULTIPLY_DEFAULT_LEVERAGE,
  MULTIPLY_OPEN_GAS,
  MULTIPLY_PAY_WITH_OTHER_ASSETS,
  MULTIPLY_QUERY_KEY_PREFIX,
} from "@/modules/strategies/multiply/config/constants"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import { useOpenCalls } from "@/modules/strategies/multiply/hooks/useOpenMultiplyPosition"
import {
  getPayMaxBalance,
  getPayQuoteState,
} from "@/modules/strategies/multiply/utils/pay"
import {
  useFeeReservedBalance,
  useFeeReserveNeed,
} from "@/modules/transactions/hooks/useFeeReservedBalance"
import { transformAnyToPapiTx } from "@/modules/transactions/utils/tx"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

/**
 * Whether a loop can be entered with another asset than its collateral: only
 * a pool-share collateral (PRIME, HUSDT, …) can; plain ones (vDOT) can't.
 * Nothing can while `MULTIPLY_PAY_WITH_OTHER_ASSETS` is off.
 */
export const useCanPickPay = () => {
  const { getAssetWithFallback, isStableSwap } = useAssets()
  return (pair: Pick<MultiplyPair, "collateralAssetId">) =>
    MULTIPLY_PAY_WITH_OTHER_ASSETS &&
    isStableSwap(getAssetWithFallback(pair.collateralAssetId))
}

/**
 * The pay → collateral sell, as the money-market supply modal quotes it, but
 * into the collateral's share token rather than its aToken. Idle when the
 * user pays with the collateral itself.
 */
export const usePayQuote = (
  pair: MultiplyPair,
  payAssetId: string,
  amount: string,
) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)
  const getMinimumTradeAmount = useMinimumTradeAmount()
  const isSwap = payAssetId !== pair.collateralAssetId

  const [debouncedAmount, isSynced] = useDebouncedValue(isSwap ? amount : "")
  const { data, isLoading, isError } = useQuery(
    bestSellWithTxQuery(rpc, {
      assetIn: payAssetId,
      assetOut: pair.collateralAssetId,
      amountIn: debouncedAmount,
      slippage,
      address: account?.address ?? "",
    }),
  )

  const hasAmount = isSwap && Number(amount || 0) > 0
  const quote = hasAmount && isSynced ? data : undefined
  const state = hasAmount
    ? getPayQuoteState({
        isLoading: isLoading || !isSynced,
        isError,
        swap: quote?.swap,
      })
    : "idle"

  return {
    isSwap,
    state,
    swap: quote?.swap,
    /** step 1's call, built for the connected account; null without one */
    tx: quote?.tx ?? null,
    /** expected collateral out, in its smallest unit */
    amountOut: quote?.swap.amountOut,
    minAmountOut: getMinimumTradeAmount(quote?.swap),
  }
}

/**
 * What the amount input may spend of the pay asset, in human units: its
 * transferable balance, less both steps' fees when it pays fees (a sell of the
 * whole balance and the open batch, estimated as one reference batch) and less
 * the fee budget when it is the pair's fee asset. While the fee is estimated
 * `isResolved` is false; MAX and submit wait for it.
 */
export const usePayMaxBalance = (pair: MultiplyPair, payAssetId: string) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)
  const { getAssetWithFallback } = useAssets()
  const { getTransferableBalance } = useAccountBalances()
  const { buildBatchTx } = useVaultEvmCall()
  const buildOpenCalls = useOpenCalls(pair)

  const balance = formatUnits(
    getTransferableBalance(payAssetId),
    getAssetWithFallback(payAssetId).decimals,
  )
  const need = useFeeReserveNeed(payAssetId, balance)
  // paying with the collateral is a single EVM batch; its fee isn't reserved here
  const needsReserve =
    need.needsReserve && payAssetId !== pair.collateralAssetId

  const step1 = bestSellWithTxQuery(rpc, {
    assetIn: payAssetId,
    assetOut: pair.collateralAssetId,
    amountIn: needsReserve ? balance : "",
    slippage,
    address: account?.address ?? "",
  })
  const reference = useQuery({
    // not per block like the quote: building step 2 reads allowances and gas
    queryKey: [
      MULTIPLY_QUERY_KEY_PREFIX,
      "entryReference",
      pair.slug,
      payAssetId,
      balance,
      slippage,
      account?.address,
    ],
    enabled: needsReserve && !!account,
    queryFn: async () => {
      const { swap, tx } = await rpc.queryClient.ensureQueryData(step1)
      if (!tx) throw new Error("No step-1 transaction")
      const step2 = await buildBatchTx(
        await buildOpenCalls({
          amount: swap.amountOut,
          leverage: MULTIPLY_DEFAULT_LEVERAGE,
          minIntentDebt: 0n,
          minIntentAToken: 0n,
          feeBudget: pair.feeBudget,
        }),
        MULTIPLY_OPEN_GAS,
      )
      const [call1, call2] = [tx, step2].map(
        (t) => transformAnyToPapiTx(rpc.papi, t)?.decodedCall,
      )
      if (!call1 || !call2) throw new Error("Unsupported transaction")
      return rpc.papi.tx.Utility.batch_all({ calls: [call1, call2] })
    },
  })
  const reserved = useFeeReservedBalance({ ...need, needsReserve }, balance, {
    tx: reference.data,
    isError: reference.isError,
  })

  return {
    ...reserved,
    // the fee math is not bound to the asset's decimals
    maxBalance: getPayMaxBalance({
      spendable: Big(reserved.maxBalance)
        .round(getAssetWithFallback(payAssetId).decimals, Big.roundDown)
        .toFixed(),
      payAssetId,
      feeAssetId: pair.feeAssetId,
      feeBudget: formatUnits(
        pair.feeBudget,
        getAssetWithFallback(pair.feeAssetId).decimals,
      ),
    }),
  }
}
