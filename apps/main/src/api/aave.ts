import { aave } from "@galacticcouncil/sdk-next"
import { useAccount } from "@galacticcouncil/web3-connect"
import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"
import Big, { BigSource } from "big.js"

import { TAssetData } from "@/api/assets"
import { useAccountBalances } from "@/api/balances"
import {
  HEALTH_FACTOR_RISK_THRESHOLD,
  MAX_DISPLAY_HF,
} from "@/modules/money-market/constants"
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

export type HealthFactorResult = {
  readonly current: string
  readonly future: string
  readonly isBelowRiskThreshold: boolean
  readonly hasChanged: boolean
  readonly isSignificantChange: boolean
  readonly isUserConsentRequired: boolean
}

const toDisplayedHf = (hf: Big) =>
  hf.eq(-1) || hf.gt(MAX_DISPLAY_HF) ? Big(-1) : hf.round(2, Big.roundDown)

export const formatHealthFactorResult = ({
  currentHF,
  futureHF,
}: {
  currentHF: BigSource
  futureHF: BigSource
}): HealthFactorResult => {
  const current = Big(currentHF)
  const future = Big(futureHF)

  const isBelowRiskThreshold =
    !future.eq(-1) && future.lt(HEALTH_FACTOR_RISK_THRESHOLD)
  const hasChanged = !future
    .round(2, Big.roundDown)
    .eq(current.round(2, Big.roundDown))
  const isSignificantChange = !toDisplayedHf(future).eq(toDisplayedHf(current))

  return {
    current: current.toString(),
    future: future.toString(),
    isBelowRiskThreshold,
    hasChanged,
    isSignificantChange,
    isUserConsentRequired: isSignificantChange && isBelowRiskThreshold,
  }
}

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
      // The reserve picks the market, so both reads must share it
      const [currentHF, futureHF] = await Promise.all([
        sdk.api.aave.getHealthFactor(address, Number(fromAssetId)),
        sdk.api.aave.getHealthFactorAfterWithdraw(
          address,
          Number(fromAssetId),
          fromAmount || "0",
        ),
      ])
      return formatHealthFactorResult({ currentHF, futureHF })
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
      const [currentHF, futureHF] = await Promise.all([
        sdk.api.aave.getHealthFactor(address, Number(toAssetId)),
        sdk.api.aave.getHealthFactorAfterSupply(
          address,
          Number(toAssetId),
          toAmount || "0",
        ),
      ])
      return formatHealthFactorResult({ currentHF, futureHF })
    },
    placeholderData: toAssetId ? keepPreviousData : undefined,
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
      const [currentHF, futureHF] = await Promise.all([
        sdk.api.aave.getHealthFactor(address, Number(fromAssetId)),
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

// `reserve` (an underlying id) picks the market, main when omitted
export const aaveSummaryQuery = (
  { isReady, sdk }: TProviderContext,
  address: string,
  reserve?: string,
  enabled = true,
) =>
  queryOptions({
    queryKey: [...AAVE_SUMMARY_QUERY_KEY, address, reserve ?? ""],
    queryFn: () =>
      sdk.api.aave.getSummary(
        address,
        reserve === undefined ? undefined : Number(reserve),
      ),
    enabled: isReady && enabled && !!address,
  })

// `reserve` is the underlying id; an aToken id would read the main market
export const maxWithdrawQuery = (
  { sdk, isReady }: TProviderContext,
  address: string,
  reserve: string,
  balance: string,
) =>
  queryOptions({
    // The balance only keys a refetch once the aToken balance moves
    queryKey: [
      ...TRANSFERABLE_ATOKEN_BALANCE_QUERY_KEY,
      "max",
      address,
      reserve,
      balance,
    ],
    queryFn: async () => {
      const { amount, decimals } = await sdk.api.aave.getMaxWithdraw(
        address,
        Number(reserve),
      )
      return scaleHuman(amount, decimals)
    },
    enabled: isReady && !!address && !!reserve,
  })

// Aave validates the health factor the moment the aToken leaves the account,
// with no credit for collateral the same batch supplies back afterwards
// (the stableswap withdrawal / the second leg of a router swap both land
// after that check). So the cap is always the plain withdraw one.
export const useTransfarebleATokenBalance = ({
  assetIn,
}: {
  assetIn: TAssetData
}) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const { getTransferableBalance } = useAccountBalances()
  const address = account?.address ?? ""

  const balance = getTransferableBalance(assetIn.id)
  const balanceShifted = scaleHuman(balance.toString(), assetIn.decimals)

  return useQuery({
    ...maxWithdrawQuery(
      rpc,
      address,
      isErc20AToken(assetIn) ? assetIn.underlyingAssetId : "",
      balanceShifted,
    ),
    select: (max) => Big.min(balanceShifted, max).toString(),
  })
}
