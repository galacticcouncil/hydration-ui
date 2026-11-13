import { isHiddenReserve } from "@galacticcouncil/money-market/core"
import {
  useHollarFacilitator,
  useMarketReserves,
  useMoneyMarket,
  useReserveSummaries,
} from "@galacticcouncil/money-market/react"
import { type ReserveSummary } from "@galacticcouncil/money-market/types"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { type Hex } from "viem"

import { useResolveReserveApy } from "@/modules/money-market/apy/ReserveApyProvider"
import {
  isHollar,
  reserveAssetId,
} from "@/modules/money-market/reserves/reserves"
import { MULTIPLY_QUERY_KEY_PREFIX } from "@/modules/strategies/multiply/config/constants"
import {
  buildCustomLoop,
  MULTIPLY_PAIRS,
  type MultiplyPair,
} from "@/modules/strategies/multiply/config/pairs"
import { usePairRiskLevels } from "@/modules/strategies/multiply/hooks/usePairRiskLevels"
import { getMultiplyUnavailableReason } from "@/modules/strategies/multiply/utils/availability"
import {
  getDeployHealthFactor,
  getMaxLeverage,
  getSliderMaxLeverage,
  projectMultiplyPosition,
} from "@/modules/strategies/multiply/utils/projection"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

const WAD = 1e18

const knownRate = (rate: { status: string; total?: string } | undefined) =>
  rate?.status === "known" && rate.total !== undefined
    ? Number(rate.total)
    : null

export type MultiplyPairMetrics = NonNullable<MultiplyPairRow["data"]>
export type MultiplyPairRow = ReturnType<
  ReturnType<typeof usePairMetricsResolver>
>

/** A loop is correlated when both reserves sit in the same non-zero eMode category. */
export const isCorrelated = (
  collateral: ReserveSummary,
  debt: ReserveSummary,
) =>
  collateral.eModeCategoryId !== 0 &&
  collateral.eModeCategoryId === debt.eModeCategoryId

// Turns any pair into its reserve-derived figures, risk and availability.
// Needs a ReserveApyProvider above it.
const usePairMetricsResolver = () => {
  const { data: reserves, isPending } = useReserveSummaries()
  const resolveApy = useResolveReserveApy()
  const { market } = useMoneyMarket()
  const facilitator = useHollarFacilitator()
  const riskOf = usePairRiskLevels(
    reserves?.map((r) => reserveAssetId(r.underlyingAsset, market)) ?? [],
  )

  const findReserve = (address: string) =>
    reserves?.find(
      (r) => r.underlyingAsset.toLowerCase() === address.toLowerCase(),
    )

  return (pair: MultiplyPair) => {
    const collateralReserve = findReserve(pair.collateral)
    const debtReserve = findReserve(pair.debt)
    const supplyRate = collateralReserve
      ? resolveApy(collateralReserve).supply
      : undefined
    const borrowRate = debtReserve ? resolveApy(debtReserve).borrow : undefined

    const hollarRoom =
      debtReserve && isHollar(debtReserve.underlyingAsset, market)
        ? facilitator.data
          ? Big.max(
              Big(facilitator.data.maxCapacity).minus(facilitator.data.level),
              0,
            ).toString()
          : null
        : undefined

    const data =
      collateralReserve && debtReserve
        ? getPairMetrics({
            pair,
            collateralReserve,
            debtReserve,
            supplyApy: knownRate(supplyRate),
            borrowApy: knownRate(borrowRate),
            hollarRoom,
            // the factory checks the aToken id and that the aToken has supply
            hasAToken:
              pair.aCollateralAssetId > 0 &&
              Number(collateralReserve.totalLiquidity) > 0,
          })
        : null

    return {
      pair,
      data,
      risk:
        data && collateralReserve && debtReserve
          ? riskOf(pair.collateralAssetId, pair.debtAssetId, {
              correlated: isCorrelated(collateralReserve, debtReserve),
              hf: data.maxLeverageHf,
            })
          : null,
      collateralReserve,
      debtReserve,
      isLoading:
        isPending ||
        supplyRate?.status === "loading" ||
        borrowRate?.status === "loading",
    }
  }
}

/** Reserve-derived figures for the given pairs, in order. */
export const useMultiplyPairsMetrics = (
  pairs: MultiplyPair[] = MULTIPLY_PAIRS,
) => {
  const resolve = usePairMetricsResolver()
  return pairs.map(resolve)
}

/**
 * aToken asset ids straight from the chain's ERC20 mapping. The asset
 * registry only knows the aTokens the router trades (no aGSOL, aHEURC, ...).
 */
const useChainATokenIds = (aTokens: string[]) => {
  const { papiClient, isReady } = useRpcProvider()
  const key = aTokens.map((a) => a.toLowerCase()).sort()

  return useQuery({
    queryKey: [MULTIPLY_QUERY_KEY_PREFIX, "aTokenIds", key],
    enabled: isReady && key.length > 0,
    staleTime: Infinity,
    queryFn: async () => {
      // not in the app's runtime descriptors, so called untyped
      const mapping = papiClient.getUnsafeApi().apis.Erc20MappingApi
      if (!mapping) return new Map<string, number>()
      const ids: unknown[] = await Promise.all(
        key.map((address) =>
          mapping.address_to_asset!(address).catch(() => undefined),
        ),
      )
      return new Map(
        key.flatMap((address, i) => {
          const id = ids[i]
          return id === undefined || id === null
            ? []
            : [[address, Number(id)] as const]
        }),
      )
    },
  }).data
}

/**
 * Builds a custom loop from two registry asset ids, or null while the
 * reserves load or when either asset has no reserve.
 */
export const useLoopBuilder = () => {
  const { data: reserves } = useReserveSummaries()
  const { data: raw } = useMarketReserves()
  const { market } = useMoneyMarket()
  const { getRelatedAToken } = useAssets()

  const byId = new Map(
    (reserves ?? [])
      .filter((r) => !isHiddenReserve(r.underlyingAsset))
      .map((r) => [reserveAssetId(r.underlyingAsset, market), r]),
  )
  const rawByAsset = new Map(
    (raw?.reserves ?? []).map((r) => [r.underlyingAsset.toLowerCase(), r]),
  )
  const chainATokenIds = useChainATokenIds(
    (raw?.reserves ?? []).map((r) => r.aTokenAddress),
  )

  const build = (collateralAssetId: string, debtAssetId: string) => {
    const collateral = byId.get(collateralAssetId)
    const debt = byId.get(debtAssetId)
    const rawCollateral =
      collateral && rawByAsset.get(collateral.underlyingAsset.toLowerCase())
    const rawDebt = debt && rawByAsset.get(debt.underlyingAsset.toLowerCase())
    if (!collateral || !debt || !rawCollateral || !rawDebt) return null

    return buildCustomLoop({
      collateralAssetId,
      debtAssetId,
      collateral: collateral.underlyingAsset as Hex,
      aCollateral: rawCollateral.aTokenAddress as Hex,
      debt: debt.underlyingAsset as Hex,
      variableDebt: rawDebt.variableDebtTokenAddress as Hex,
      aCollateralAssetId: Number(
        getRelatedAToken(collateralAssetId)?.id ??
          chainATokenIds?.get(rawCollateral.aTokenAddress.toLowerCase()) ??
          0,
      ),
      eMode: isCorrelated(collateral, debt) ? collateral.eModeCategoryId : 0,
    })
  }

  return { build, assetIds: [...byId.keys()], isReady: !!reserves && !!raw }
}

/**
 * Every collateral × debt combination of the market as a custom loop, with
 * its metrics, risk and availability. Pure arithmetic over cached reads.
 */
export const useLoopCandidates = () => {
  const { build, assetIds, isReady } = useLoopBuilder()
  const resolve = usePairMetricsResolver()

  if (!isReady) return null

  return assetIds.flatMap((collateralAssetId) =>
    assetIds.flatMap((debtAssetId) => {
      if (collateralAssetId === debtAssetId) return []
      const pair = build(collateralAssetId, debtAssetId)
      return pair ? [resolve(pair)] : []
    }),
  )
}

const getPairMetrics = ({
  pair,
  collateralReserve,
  debtReserve,
  supplyApy,
  borrowApy,
  hollarRoom,
  hasAToken,
}: {
  pair: MultiplyPair
  collateralReserve: ReserveSummary
  debtReserve: ReserveSummary
  supplyApy: number | null
  borrowApy: number | null
  // Hollar is minted, so its room is the facilitator bucket, not the
  // reserve's liquidity (same rule as the borrow dashboard); undefined when
  // the debt is not Hollar
  hollarRoom: string | null | undefined
  hasAToken: boolean
}) => {
  // the position contract enters pair.eMode, so the category's figures apply
  const inEMode =
    pair.eMode !== 0 && collateralReserve.eModeCategoryId === pair.eMode
  const lt = Number(
    inEMode
      ? collateralReserve.eModeLiquidationThreshold
      : collateralReserve.liquidationThreshold,
  )
  const ltv = Number(
    inEMode ? collateralReserve.eModeLtv : collateralReserve.ltv,
  )
  const minHf = Number(pair.minHf) / WAD
  const maxLeverage = getSliderMaxLeverage(getMaxLeverage({ lt, ltv, minHf }))

  const unavailableReason = getMultiplyUnavailableReason(
    collateralReserve,
    debtReserve,
    {
      sameAsset: pair.collateralAssetId === pair.debtAssetId,
      maxLeverage,
      hasAToken,
      hollarRoom,
    },
  )

  const maxNetApy =
    supplyApy !== null && borrowApy !== null && maxLeverage > 1
      ? projectMultiplyPosition({
          amount: 1,
          collateralPriceUsd: Number(collateralReserve.priceInUsd),
          debtPriceUsd: Number(debtReserve.priceInUsd),
          leverage: maxLeverage,
          lt,
          minHf,
          supplyApy,
          borrowApy,
        }).netApy
      : null

  return {
    lt,
    ltv,
    minHf,
    maxLeverage,
    // above minHf when LTV, not minHf, caps the leverage
    maxLeverageHf: getDeployHealthFactor(lt, minHf, maxLeverage),
    supplyApy,
    borrowApy,
    maxNetApy,
    availableLiquidity:
      hollarRoom !== undefined ? hollarRoom : debtReserve.availableLiquidity,
    unavailableReason,
  }
}
