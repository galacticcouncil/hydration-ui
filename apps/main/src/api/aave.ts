import {
  calculateMaxWithdrawAmount,
  formatHealthFactorResult,
  GhoService,
  UiIncentiveDataProvider,
  UiPoolDataProvider,
} from "@galacticcouncil/money-market/utils"
import { aave } from "@galacticcouncil/sdk-next"
import {
  getAddressFromAssetId,
  QUERY_KEY_BLOCK_PREFIX,
  safeConvertAnyToH160,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { TAssetData } from "@/api/assets"
import { useAccountBalances } from "@/api/balances"
import {
  borrowReserveQuery,
  lendingPoolAddressProvider,
  useBorrowIncentivesContract,
  useBorrowPoolDataContract,
  useGhoServiceContract,
  userBorrowSummaryQuery,
} from "@/api/borrow"
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

export const healthFactorAfterWithdrawQuery = (
  { sdk, isReady }: TProviderContext,
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
    enabled: isReady && !!address && !!fromAssetId,
  })

export const healthFactorAfterSupplyQuery = (
  { sdk, isReady }: TProviderContext,
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
    enabled: isReady && !!address && !!toAssetId,
  })

export const healthFactorAfterSwapQuery = (
  { sdk, isReady }: TProviderContext,
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

export const aaveSummaryQuery = (
  { isReady, sdk }: TProviderContext,
  address: string,
  enabled = true,
) =>
  queryOptions({
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "aave", "summary", address],
    queryFn: () => sdk.api.aave.getSummary(address),
    enabled: isReady && enabled && !!address,
  })

// Aave validates the health factor the moment the aToken leaves the account,
// with no credit for collateral the same batch supplies back afterwards
// (the stableswap withdrawal / the second leg of a router swap both land
// after that check). So the cap is always the plain withdraw one.
export const getTransfarebleATokenBalance = (
  rpc: TProviderContext,
  address: string,
  balanceShifted: string,
  assetIn: TAssetData,
  poolDataContract: UiPoolDataProvider | null,
  ghoServiceContract: GhoService | null,
  incentivesContract: UiIncentiveDataProvider | null,
  onSuccess?: (maxBalance: string) => void,
) =>
  queryOptions({
    queryKey: [
      "transfarebleATokenBalance",
      address,
      balanceShifted,
      assetIn.id,
    ],
    queryFn: async () => {
      let maxBalance = balanceShifted

      if (isErc20AToken(assetIn)) {
        const evmAddress = safeConvertAnyToH160(address)
        const underlyingAsset = getAddressFromAssetId(assetIn.underlyingAssetId)

        const [user, poolReserve] = await Promise.all([
          rpc.queryClient.ensureQueryData(
            userBorrowSummaryQuery(
              evmAddress,
              rpc,
              lendingPoolAddressProvider,
              poolDataContract,
              ghoServiceContract,
              incentivesContract,
            ),
          ),
          rpc.queryClient.ensureQueryData(
            borrowReserveQuery(
              rpc,
              lendingPoolAddressProvider,
              poolDataContract,
              incentivesContract,
              underlyingAsset,
            ),
          ),
        ])

        const userReserveIn = user.userReservesData.find(
          (reserve) => reserve.underlyingAsset === underlyingAsset,
        )

        if (userReserveIn && poolReserve) {
          maxBalance = calculateMaxWithdrawAmount(
            user,
            userReserveIn,
            poolReserve,
          ).toString()
        }
      }

      onSuccess?.(maxBalance)
      return maxBalance
    },
    enabled: rpc.isReady && !!address,
  })

export const useTransfarebleATokenBalance = ({
  assetIn,
  onSuccess,
}: {
  assetIn: TAssetData
  onSuccess?: (maxBalance: string) => void
}) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const { getTransferableBalance } = useAccountBalances()
  const poolDataContract = useBorrowPoolDataContract()
  const ghoServiceContract = useGhoServiceContract()
  const incentivesContract = useBorrowIncentivesContract()
  const address = account?.address ?? ""

  const balance = getTransferableBalance(assetIn.id)
  const balanceShifted = scaleHuman(balance.toString(), assetIn.decimals)

  return useQuery(
    getTransfarebleATokenBalance(
      rpc,
      address,
      balanceShifted,
      assetIn,
      poolDataContract,
      ghoServiceContract,
      incentivesContract,
      onSuccess,
    ),
  )
}
