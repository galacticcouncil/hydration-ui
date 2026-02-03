import { formatHealthFactorResult } from "@galacticcouncil/money-market/utils"
import { aave } from "@galacticcouncil/sdk-next"
import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import Big from "big.js"

import { TAssetData } from "@/api/assets"
import { isErc20AToken } from "@/providers/assetsProvider"
import { TProviderContext } from "@/providers/rpcProvider"

type HealthFactorArgs = {
  readonly address: string
  readonly fromAssetId: string
  readonly fromAmount: string
  readonly toAssetId: string
  readonly toAmount: string
}

type HealthFactorWithdrawArgs = Pick<
  HealthFactorArgs,
  "address" | "fromAssetId" | "fromAmount"
>

type HealthFactorSupplyArgs = Pick<
  HealthFactorArgs,
  "address" | "toAssetId" | "toAmount"
>

type HealthFactorQueryArgs = Pick<
  HealthFactorArgs,
  "address" | "fromAmount" | "toAmount"
> & {
  fromAsset: TAssetData | null
  toAsset: TAssetData | null
}

export const AAVE_GAS_LIMIT = aave.AAVE_GAS_LIMIT

export const healthFactorAfterWithdrawQuery = (
  { sdk, isLoaded }: TProviderContext,
  { address, fromAssetId, fromAmount }: HealthFactorWithdrawArgs,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "healthFactor",
      "withdraw",
      address,
      fromAssetId,
      fromAmount,
    ],

    queryFn: async () => {
      const [currentHF, futureHF] = await Promise.all([
        sdk.api.aave.getHealthFactor(address),
        sdk.api.aave.getHealthFactorAfterWithdraw(
          address,
          Number(fromAssetId),
          fromAmount || "0",
        ),
      ])
      return formatHealthFactorResult({ currentHF, futureHF })
    },
    placeholderData: keepPreviousData,
    enabled: isLoaded && !!address && !!fromAssetId,
  })

export const healthFactorAfterSupplyQuery = (
  { sdk, isLoaded }: TProviderContext,
  { address, toAssetId, toAmount }: HealthFactorSupplyArgs,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "healthFactor",
      "supply",
      address,
      toAssetId,
      toAmount,
    ],
    queryFn: async () => {
      const [currentHF, futureHF] = await Promise.all([
        sdk.api.aave.getHealthFactor(address),
        sdk.api.aave.getHealthFactorAfterSupply(
          address,
          Number(toAssetId),
          toAmount || "0",
        ),
      ])
      return formatHealthFactorResult({ currentHF, futureHF })
    },
    placeholderData: keepPreviousData,
    enabled: isLoaded && !!address && !!toAssetId,
  })

export const healthFactorAfterSwapQuery = (
  { sdk, isLoaded }: TProviderContext,
  { address, fromAssetId, fromAmount, toAssetId, toAmount }: HealthFactorArgs,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "healthFactor",
      "swap",
      address,
      fromAssetId,
      fromAmount,
      toAssetId,
      toAmount,
    ],
    queryFn: async () => {
      const [currentHF, futureHF] = await Promise.all([
        sdk.api.aave.getHealthFactor(address),
        sdk.api.aave.getHealthFactorAfterSwap(
          address,
          fromAmount,
          Number(fromAssetId),
          toAmount,
          Number(toAssetId),
        ),
      ])
      return formatHealthFactorResult({ currentHF, futureHF })
    },
    placeholderData: keepPreviousData,
    enabled:
      isLoaded &&
      !!address &&
      !!fromAssetId &&
      Big(fromAmount || "0").gt(0) &&
      !!toAssetId &&
      Big(toAmount || "0").gt(0),
  })

export const healthFactorQuery = (
  rpc: TProviderContext,
  { address, fromAsset, fromAmount, toAsset, toAmount }: HealthFactorQueryArgs,
) => {
  const isSwappingATokens =
    !!fromAsset &&
    isErc20AToken(fromAsset) &&
    !!toAsset &&
    isErc20AToken(toAsset)

  if (isSwappingATokens) {
    return healthFactorAfterSwapQuery(rpc, {
      address,
      fromAssetId: fromAsset.underlyingAssetId,
      fromAmount,
      toAssetId: toAsset.underlyingAssetId,
      toAmount,
    })
  }

  const isWithdraw = !!fromAsset && isErc20AToken(fromAsset) && !!fromAmount

  if (isWithdraw) {
    return healthFactorAfterWithdrawQuery(rpc, {
      address,
      fromAssetId: fromAsset.underlyingAssetId,
      fromAmount,
    })
  }

  const isSupply = !!toAsset && isErc20AToken(toAsset) && !!toAmount

  return healthFactorAfterSupplyQuery(rpc, {
    address,
    toAssetId: isSupply ? toAsset.underlyingAssetId : "",
    toAmount,
  })
}
