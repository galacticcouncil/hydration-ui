import { big } from "@galacticcouncil/common"
import { formatHealthFactorResult } from "@galacticcouncil/money-market/utils"
import { aave } from "@galacticcouncil/sdk-next"
import { useAccount } from "@galacticcouncil/web3-connect"
import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { TAssetData } from "@/api/assets"
import { useAccountBalances } from "@/api/balances"
import { isErc20AToken } from "@/providers/assetsProvider"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

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

export const TRANSFERABLE_ATOKEN_BALANCE_QUERY_KEY = [
  "transfarebleATokenBalance",
] as const

export const AAVE_HEALTH_FACTOR_QUERY_KEY = ["healthFactor"] as const

export const AAVE_SUMMARY_QUERY_KEY = ["aave", "summary"] as const

export const healthFactorAfterWithdrawQuery = (
  { sdk, isReady }: TProviderContext,
  { address, fromAssetId, fromAmount }: HealthFactorWithdrawArgs,
) =>
  queryOptions({
    refetchInterval: 60_000,
    queryKey: [
      ...AAVE_HEALTH_FACTOR_QUERY_KEY,
      "withdraw",
      address,
      fromAssetId,
      fromAmount,
    ],
    queryFn: async () => {
      const { current, projected } = await sdk.api.aave.previewWithdraw(
        address,
        Number(fromAssetId),
        fromAmount || "0",
      )
      return formatHealthFactorResult({
        currentHF: current,
        futureHF: projected,
      })
    },
    placeholderData: keepPreviousData,
    enabled: isReady && !!address && !!fromAssetId,
  })

export const healthFactorAfterSupplyQuery = (
  { sdk, isReady }: TProviderContext,
  { address, toAssetId, toAmount }: HealthFactorSupplyArgs,
) =>
  queryOptions({
    refetchInterval: 60_000,
    queryKey: [
      ...AAVE_HEALTH_FACTOR_QUERY_KEY,
      "supply",
      address,
      toAssetId,
      toAmount,
    ],
    queryFn: async () => {
      const { current, projected } = await sdk.api.aave.previewSupply(
        address,
        Number(toAssetId),
        toAmount || "0",
      )
      return formatHealthFactorResult({
        currentHF: current,
        futureHF: projected,
      })
    },
    placeholderData: keepPreviousData,
    enabled: isReady && !!address && !!toAssetId,
  })

export const healthFactorAfterSwapQuery = (
  { sdk, isReady }: TProviderContext,
  { address, fromAssetId, fromAmount, toAssetId, toAmount }: HealthFactorArgs,
) =>
  queryOptions({
    refetchInterval: 60_000,
    queryKey: [
      ...AAVE_HEALTH_FACTOR_QUERY_KEY,
      "swap",
      address,
      fromAssetId,
      fromAmount,
      toAssetId,
      toAmount,
    ],
    queryFn: async () => {
      const summary = await sdk.api.aave.getSummary(
        address,
        Number(fromAssetId),
      )

      // The received aToken only counts when it shares the market of the
      // sold one, whose health factor is the one at stake
      const toDelta = (aTokenId: string, amount: string, out: boolean) => {
        const reserve = summary.reserves.find(
          (reserve) => reserve.aTokenId === Number(aTokenId),
        )
        if (!reserve) return []
        const native = big.toBigInt(amount, reserve.decimals)
        return [{ reserve, amount: out ? -native : native }]
      }

      const futureHF = aave.projectHealthFactor(summary, [
        ...toDelta(fromAssetId, fromAmount, true),
        ...toDelta(toAssetId, toAmount, false),
      ])

      return formatHealthFactorResult({
        currentHF: summary.healthFactor,
        futureHF,
      })
    },
    placeholderData: keepPreviousData,
    enabled:
      isReady &&
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
      fromAssetId: fromAsset.id,
      fromAmount,
      toAssetId: toAsset.id,
      toAmount,
    })
  }

  const isWithdraw = !!fromAsset && isErc20AToken(fromAsset) && !!fromAmount

  if (isWithdraw) {
    return healthFactorAfterWithdrawQuery(rpc, {
      address,
      fromAssetId: fromAsset.id,
      fromAmount,
    })
  }

  const isSupply = !!toAsset && isErc20AToken(toAsset) && !!toAmount

  return healthFactorAfterSupplyQuery(rpc, {
    address,
    toAssetId: isSupply ? toAsset.id : "",
    toAmount,
  })
}

export const aaveSummaryQuery = (
  { isReady, sdk }: TProviderContext,
  address: string,
  aTokenId: string,
  enabled = true,
) =>
  queryOptions({
    queryKey: [...AAVE_SUMMARY_QUERY_KEY, address, aTokenId],
    queryFn: () => sdk.api.aave.getSummary(address, Number(aTokenId)),
    enabled: isReady && enabled && !!address && !!aTokenId,
  })

// Aave validates the health factor the moment the aToken leaves the account,
// with no credit for collateral the same batch supplies back afterwards
// (the stableswap withdrawal / the second leg of a router swap both land
// after that check). So the cap is always the plain withdraw one.
export const maxWithdrawQuery = (
  { sdk, isReady }: TProviderContext,
  address: string,
  aTokenId: string,
  balance: string,
) =>
  queryOptions({
    // The balance only keys a refetch once the aToken balance moves
    queryKey: [
      ...TRANSFERABLE_ATOKEN_BALANCE_QUERY_KEY,
      address,
      aTokenId,
      balance,
    ],
    queryFn: async () => {
      const { amount, decimals } = await sdk.api.aave.getMaxWithdraw(
        address,
        Number(aTokenId),
      )
      return scaleHuman(amount, decimals)
    },
    enabled: isReady && !!address && !!aTokenId,
  })

export const useTransfarebleATokenBalance = ({
  assetIn,
}: {
  assetIn: TAssetData
}) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const { getTransferableBalance } = useAccountBalances()

  return useQuery(
    maxWithdrawQuery(
      rpc,
      account?.address ?? "",
      isErc20AToken(assetIn) ? assetIn.id : "",
      getTransferableBalance(assetIn.id).toString(),
    ),
  )
}
