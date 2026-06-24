import { formatHealthFactorResult } from "@galacticcouncil/money-market/utils"
import { aave, SdkCtx } from "@galacticcouncil/sdk-next"
import {
  getAssetIdFromAddress,
  QUERY_KEY_BLOCK_PREFIX,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { TAssetData } from "@/api/assets"
import { isErc20AToken } from "@/providers/assetsProvider"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
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

export const aaveSummaryQuery = (
  { isApiLoaded, sdk }: TProviderContext,
  address: string,
  enabled = true,
) =>
  queryOptions({
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "aave", "summary", address],
    queryFn: () => sdk.api.aave.getSummary(address),
    enabled: isApiLoaded && enabled && !!address,
  })

type AaveSummary = Awaited<ReturnType<SdkCtx["api"]["aave"]["getSummary"]>>
type AaveReserveData = AaveSummary["reserves"][number]

const TARGET_WITHDRAW_HF = 1.01
const SWAP_AMOUNT_THRESHOLD = 0.98 // 2% slippage + fee

const calculateSwapToAmount = (
  fromAmount: string,
  reserveIn: AaveReserveData,
  reserveOut: AaveReserveData,
  amountOutRatio: string,
) =>
  Big(fromAmount || "0")
    .mul(reserveIn.priceInRef.toString())
    .div(reserveOut.priceInRef.toString())
    .mul(SWAP_AMOUNT_THRESHOLD)
    .mul(amountOutRatio)
    .toFixed(reserveOut.decimals, Big.roundDown)

const calculateWithdrawMax = (
  reserve: AaveReserveData,
  totalDebt: bigint,
  currentHF: number,
) => {
  const {
    aTokenBalance,
    availableLiquidity,
    decimals,
    priceInRef,
    reserveLiquidationThreshold,
    isCollateral,
  } = reserve

  let maxWithdrawableTokens = aTokenBalance

  // If the asset is used as collateral and user has debt, compute HF-limited max
  if (isCollateral && totalDebt > 0n) {
    const excessHF = currentHF - TARGET_WITHDRAW_HF

    if (excessHF > 0) {
      const maxCollateralToWithdrawInRef = Big(excessHF)
        .mul(totalDebt.toString())
        .div(reserveLiquidationThreshold)
        .toFixed(0, Big.roundDown)

      const hfCapped = Big(maxCollateralToWithdrawInRef)
        .div(priceInRef.toString())
        .mul(10 ** decimals)
        .toFixed(0, Big.roundDown)

      maxWithdrawableTokens =
        aTokenBalance < BigInt(hfCapped) ? aTokenBalance : BigInt(hfCapped)
    } else {
      maxWithdrawableTokens = 0n
    }
  }

  const maxOrCap =
    maxWithdrawableTokens < availableLiquidity
      ? maxWithdrawableTokens
      : availableLiquidity

  return {
    amount: maxOrCap,
    decimals,
  }
}

const getWithdrawHF = (
  currentHF: number,
  futureHF: number,
  hasReferenceAmount: boolean,
) => {
  if (!hasReferenceAmount || futureHF < 0 || currentHF <= TARGET_WITHDRAW_HF) {
    return currentHF
  }

  const excessHF = currentHF - TARGET_WITHDRAW_HF
  const hfDrop = currentHF - futureHF || 1

  return TARGET_WITHDRAW_HF + (excessHF * excessHF) / hfDrop
}

export const getTransfarebleATokenBalance = (
  rpc: TProviderContext,
  address: string,
  balanceShifted: string,
  assetIn: TAssetData,
  assetOut: TAssetData | null,
  amountOutRatio: string,
  onSuccess?: (maxBalance: string) => void,
) =>
  queryOptions({
    queryKey: [
      "transfarebleATokenBalance",
      address,
      balanceShifted,
      assetIn.id,
      assetOut?.id,
      amountOutRatio,
    ],
    queryFn: async () => {
      const isSwappingATokens =
        isErc20AToken(assetIn) && assetOut && isErc20AToken(assetOut)

      let maxBalance = balanceShifted

      if (isSwappingATokens) {
        const aaveSummary = await rpc.queryClient.fetchQuery(
          aaveSummaryQuery(rpc, address),
        )
        let reserveIn: AaveReserveData | undefined
        let reserveOut: AaveReserveData | undefined

        for (const reserve of aaveSummary.reserves) {
          const assetId = getAssetIdFromAddress(reserve.reserveAsset)

          if (assetId === assetIn.underlyingAssetId) {
            reserveIn = reserve
          }
          if (assetId === assetOut.underlyingAssetId) {
            reserveOut = reserve
          }
          if (reserveIn && reserveOut) break
        }

        const toAmount =
          reserveIn && reserveOut
            ? calculateSwapToAmount(
                balanceShifted,
                reserveIn,
                reserveOut,
                amountOutRatio ?? "1",
              )
            : "0"

        const { current, future } = await rpc.queryClient.fetchQuery(
          healthFactorAfterSwapQuery(rpc, {
            address,
            fromAssetId: assetIn.underlyingAssetId,
            fromAmount: balanceShifted,
            toAssetId: assetOut.underlyingAssetId,
            toAmount,
          }),
        )

        if (reserveIn && aaveSummary) {
          const { amount, decimals } = calculateWithdrawMax(
            reserveIn,
            aaveSummary.totalDebt,
            getWithdrawHF(Number(current), Number(future), true),
          )

          maxBalance = scaleHuman(amount.toString(), decimals)
        } else {
          maxBalance = balanceShifted
        }
      }

      onSuccess?.(maxBalance)
      return maxBalance
    },
    enabled: rpc.isApiLoaded && !!address,
  })

export const useTransfarebleATokenBalance = ({
  assetIn,
  assetOut,
  amountOutRatio,
  onSuccess,
}: {
  assetIn: TAssetData
  assetOut: TAssetData | null
  amountOutRatio?: string
  onSuccess?: (maxBalance: string) => void
}) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const { getTransferableBalance } = useAccountBalances()
  const address = account?.address ?? ""

  const balance = getTransferableBalance(assetIn.id)
  const balanceShifted = scaleHuman(balance.toString(), assetIn.decimals)

  return useQuery(
    getTransfarebleATokenBalance(
      rpc,
      address,
      balanceShifted,
      assetIn,
      assetOut,
      amountOutRatio ?? "1",
      onSuccess,
    ),
  )
}
