import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { formatUnits } from "viem"

import { AAVE_GAS_LIMIT } from "@/api/aave"
import { bestSellQuery, bestSellWithTxQuery } from "@/api/trade"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import { depositCapacityQuery } from "@/modules/strategies/propeller/hooks/useVaultReads"
import {
  isExactAmount,
  parseExactAmount,
} from "@/modules/strategies/propeller/utils/amount"
import {
  buildDepositBuy,
  isUnwrapRoute,
  readBuyLimit,
  readSwapDeposit,
  readUnwrapDeposit,
  sizeSwapDeposit,
} from "@/modules/strategies/propeller/utils/deposit"
import {
  isSwapDeposit,
  type PropellerDepositOption,
} from "@/modules/strategies/propeller/utils/depositOptions"
import { useAssets } from "@/providers/assetsProvider"
import { type TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

/**
 * One query for the sell, the room and the buy they size, so a new block swaps
 * them together and the form never pairs a buy with another amount's quote.
 * Null when the typed amount can't pay for the deposit.
 */
export const swapDepositBuyQuery = (
  rpc: TProviderContext,
  {
    vault,
    assetIn,
    amountIn,
    decimalsIn,
    collateralDecimals,
    address,
    enabled = true,
  }: {
    vault: PropellerVaultConfig
    assetIn: string
    amountIn: string
    decimalsIn: number
    collateralDecimals: number
    address: string
    enabled?: boolean
  },
) => {
  const { sdk, queryClient } = rpc
  return queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "propeller",
      "swapDepositBuy",
      vault.vaultAddress,
      assetIn,
      amountIn,
      address,
    ],
    enabled: enabled && rpc.isReady && !!amountIn,
    queryFn: async () => {
      const [sell, { maximum }] = await Promise.all([
        queryClient.ensureQueryData(
          bestSellQuery(rpc, { assetIn, assetOut: vault.assetId, amountIn }),
        ),
        queryClient.ensureQueryData(depositCapacityQuery(rpc, vault)),
      ])
      const amountOut = sizeSwapDeposit(
        sell.amountOut,
        maximum,
        collateralDecimals,
      )
      if (amountOut <= 0n) return null
      const buy = await sdk.api.router.getBestBuy(
        Number(assetIn),
        Number(vault.assetId),
        formatUnits(amountOut, collateralDecimals),
      )
      const maxAmountIn = readBuyLimit(buy.swaps, {
        amountIn: buy.amountIn,
        typedAmount: parseExactAmount(amountIn, decimalsIn),
      })
      if (maxAmountIn === null) return null
      const needsExtraGas =
        !!address &&
        (await sdk.api.aave.requiresExtraGas(address, Number(assetIn)))
      return {
        amountOut,
        maxAmountIn,
        amountIn: buy.amountIn,
        swaps: buy.swaps,
        extraGas: needsExtraGas ? AAVE_GAS_LIMIT : undefined,
      }
    },
  })
}

export const useDepositQuote = (
  deposit: PropellerDepositOption,
  amountIn: string,
  decimals: number,
) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()
  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)
  const isSwap = isSwapDeposit(deposit)
  const address = account?.address ?? ""

  const [debouncedAmount, isSynced] = useDebouncedValue(amountIn)
  const quotedAmount =
    isSwap && isExactAmount(debouncedAmount, decimals) ? debouncedAmount : ""

  const { data, isLoading, isError } = useQuery(
    bestSellWithTxQuery(rpc, {
      assetIn: deposit.assetId,
      assetOut: deposit.vault.assetId,
      amountIn: quotedAmount,
      slippage,
      address,
    }),
  )

  const quote = isSynced && quotedAmount ? data : undefined
  const swap = quote?.swap
  const quotedTx = quote?.tx ?? null
  const assetInId = Number(deposit.assetId)
  const assetOutId = Number(deposit.vault.assetId)
  const isUnwrap = isUnwrapRoute(swap?.swaps, {
    assetIn: assetInId,
    assetOut: assetOutId,
  })

  const {
    data: buyData,
    isLoading: isBuyLoading,
    isError: isBuyError,
  } = useQuery(
    swapDepositBuyQuery(rpc, {
      vault: deposit.vault,
      assetIn: deposit.assetId,
      amountIn: quotedAmount,
      decimalsIn: decimals,
      collateralDecimals: getAssetWithFallback(deposit.vault.assetId).decimals,
      address,
      enabled: !!swap && !isUnwrap,
    }),
  )
  const buyQuote = quote && !isUnwrap ? buyData : undefined

  const prepared = useMemo(() => {
    if (!swap) return null
    try {
      if (!isUnwrap) {
        if (!buyQuote) return null
        return {
          exact: false,
          depositAmount: buyQuote.amountOut,
          maxAmountIn: buyQuote.maxAmountIn,
          leftover: swap.amountIn - buyQuote.amountIn,
          tx: address
            ? buildDepositBuy(rpc.papi, {
                ...buyQuote,
                assetIn: assetInId,
                assetOut: assetOutId,
              })
            : null,
        }
      }
      // without a wallet there is no tx to read the limit from, only the route
      if (!quotedTx) {
        return {
          exact: true,
          depositAmount:
            readUnwrapDeposit(swap.swaps, {
              assetIn: assetInId,
              assetOut: assetOutId,
              amountIn: swap.amountIn,
            }) ?? undefined,
          maxAmountIn: swap.amountIn,
          tx: null,
        }
      }
      const { depositAmount, tradeCall } = readSwapDeposit(
        quotedTx.decodedCall,
        {
          assetIn: deposit.assetId,
          collateralId: deposit.vault.assetId,
          quotedAmountIn: swap.amountIn,
        },
      )
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
      return build
        ? {
            exact: true,
            depositAmount,
            maxAmountIn: swap.amountIn,
            tx: build(value.value),
          }
        : null
    } catch {
      return null
    }
  }, [
    quotedTx,
    swap,
    isUnwrap,
    buyQuote,
    address,
    assetInId,
    assetOutId,
    deposit.assetId,
    deposit.vault.assetId,
    rpc.papi,
  ])

  const isQuoteLoading = !isSynced || isLoading || isBuyLoading

  return {
    isSwap,
    swap,
    tx: prepared?.tx ?? null,
    depositAmount: prepared?.depositAmount,
    maxAmountIn: prepared?.maxAmountIn,
    leftover: prepared?.leftover,
    exact: prepared?.exact ?? false,
    isLoading: isSwap && !!amountIn && isQuoteLoading,
    // a quote whose call can't be turned into a deposit is as good as none
    isError:
      isSwap &&
      !!quotedAmount &&
      (isError ||
        (!!swap &&
          !isUnwrap &&
          (isBuyError || (!isBuyLoading && buyData === null))) ||
        (!isQuoteLoading && !!swap && !prepared)),
  }
}
