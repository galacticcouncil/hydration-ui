import type { ReserveSummary } from "@galacticcouncil/money-market/types"
import {
  getAddressFromAssetId,
  getAssetIdFromAddress,
} from "@galacticcouncil/utils"
import Big from "big.js"

import type { ExternalApyType } from "@/api/borrow/externalApys"
import type { BorrowAssetApyData, UnderlyingAssetApy } from "@/api/borrow/hooks"
import type { TStablepoolDetails } from "@/modules/liquidity/Liquidity.utils"

type Incentive = BorrowAssetApyData["incentives"][number]

/** `apy` is a percentage; null when the feed is unavailable, absent while it loads. */
export type ExternalApy = { apyType: ExternalApyType; apy?: number | null }

export type BorrowAssetApyInput = {
  assetId: string
  /** The pool's assets when `assetId` is a stableswap share. */
  poolAssetIds?: string[]
  /** Summaries of every `hydration_v3` reserve. */
  reserves: ReadonlyArray<
    Pick<
      ReserveSummary,
      "underlyingAsset" | "supplyApy" | "variableBorrowApy" | "supplyIncentives"
    >
  >
  /** External feed readings, by the asset id they are for. */
  externalApys: ReadonlyMap<string, ExternalApy>
  stablepoolData: TStablepoolDetails | undefined
  lpAPY: number | undefined
  /** The asset an aToken wraps (`getErc20AToken`), absent for other assets. */
  getATokenUnderlyingId: (assetId: string) => string | undefined
  /** The aToken of a reserve's asset (`getRelatedAToken`), if any. */
  getRelatedATokenId: (assetId: string) => string | undefined
}

const sameAddress = (a: string, b: string) =>
  a.toLowerCase() === b.toLowerCase()

const calculateIncentivesNetAPR = (incentives: Incentive[]) => {
  const isIncentivesInfinity = incentives.some(
    (incentive) => incentive.incentiveAPR === "Infinity",
  )

  if (isIncentivesInfinity) {
    return Infinity
  }

  const total = incentives.reduce(
    (total, incentive) => total + Number(incentive.incentiveAPR),
    0,
  )

  const percent = total * 100

  return percent
}

type UnderlyingAssetApyDefined = UnderlyingAssetApy & {
  supplyApy: number
  borrowApy: number
}
const hasDefinedApy = (
  assets: UnderlyingAssetApy[],
): assets is UnderlyingAssetApyDefined[] =>
  assets.every((asset) => asset.supplyApy !== null && asset.borrowApy !== null)

const calculateTotalSupplyAndBorrowApy = (
  underlyingAssetsApyData: UnderlyingAssetApy[],
  incentivesNetAPR: number,
  lpAPY: number,
) => {
  if (!hasDefinedApy(underlyingAssetsApyData)) {
    return {
      underlyingSupplyApy: null,
      underlyingBorrowApy: null,
      supplyMMApy: null,
      borrowMMApy: null,
      totalSupplyApy: null,
      totalBorrowApy: null,
    }
  }

  let underlyingSupplyApy: number = 0
  let underlyingBorrowApy: number = 0

  for (const asset of underlyingAssetsApyData) {
    underlyingSupplyApy += asset.supplyApy
    underlyingBorrowApy += asset.borrowApy
  }

  const supplyMMApy = underlyingSupplyApy + incentivesNetAPR
  const borrowMMApy = underlyingBorrowApy + incentivesNetAPR
  const totalSupplyApy = supplyMMApy + lpAPY
  const totalBorrowApy = borrowMMApy + lpAPY

  return {
    underlyingSupplyApy,
    underlyingBorrowApy,
    supplyMMApy,
    borrowMMApy,
    totalSupplyApy,
    totalBorrowApy,
  }
}

const calculateAssetProportionInStablepool = (
  assetId: string,
  stablepoolData: TStablepoolDetails | undefined,
) => {
  const allReserves = stablepoolData?.reserves ?? []
  const reserve = allReserves.find(
    (reserve) => reserve.asset_id.toString() === assetId,
  )
  const totalAmount = stablepoolData?.totalDisplayAmount
  const reserveAmount = reserve?.displayAmount

  if (totalAmount && reserveAmount) {
    return Big(reserveAmount).div(totalAmount).toNumber()
  }
}

/**
 * The APY data of a pool, farm or vault asset, from the `hydration_v3`
 * reserve summaries and the app's feed, pool and LP-fee readings.
 *
 * A stableswap share sums its pool assets' base APYs (each an aToken's
 * underlying reserve) and feed APYs, weighted by the asset's share of the
 * pool, or `1 / count` when the share cannot be read. Incentives are the
 * share's own reserve's supply incentives and count on both sides, as does
 * the LP fee. An unavailable feed makes every total null.
 */
export const toBorrowAssetApyData = ({
  assetId,
  poolAssetIds,
  reserves,
  externalApys,
  stablepoolData,
  lpAPY,
  getATokenUnderlyingId,
  getRelatedATokenId,
}: BorrowAssetApyInput): BorrowAssetApyData => {
  const stableSwapAssetIds = poolAssetIds ?? [assetId]
  const assetCount = stableSwapAssetIds.length

  const assetAddress = getAddressFromAssetId(assetId)
  const allIncentives = (
    reserves.find(({ underlyingAsset }) =>
      sameAddress(underlyingAsset, assetAddress),
    )?.supplyIncentives ?? []
  ).map<Incentive>(({ rewardApr, rewardTokenAddress, rewardTokenSymbol }) => ({
    incentiveAPR: rewardApr,
    rewardTokenAddress,
    rewardTokenSymbol,
  }))

  const underlyingAddresses = stableSwapAssetIds.map((id) =>
    getAddressFromAssetId(getATokenUnderlyingId(id) ?? id),
  )

  const underlyingReserves = reserves.filter(({ underlyingAsset }) =>
    underlyingAddresses.some((address) =>
      sameAddress(address, underlyingAsset),
    ),
  )

  const underlyingAssetsApyData = underlyingReserves.map<UnderlyingAssetApy>(
    (reserve) => {
      const id = getAssetIdFromAddress(reserve.underlyingAsset)
      const balanceId = getRelatedATokenId(id) ?? id
      const proportion =
        calculateAssetProportionInStablepool(balanceId, stablepoolData) ||
        1 / assetCount

      return {
        id,
        supplyApy: Big(reserve.supplyApy)
          .times(100)
          .times(proportion)
          .toNumber(),
        borrowApy: Big(reserve.variableBorrowApy)
          .times(100)
          .times(proportion)
          .toNumber(),
      }
    },
  )

  for (const id of stableSwapAssetIds) {
    const externalApy = externalApys.get(id)

    if (externalApy && externalApy.apy !== undefined) {
      const proportion =
        calculateAssetProportionInStablepool(id, stablepoolData) ||
        1 / assetCount

      const apy =
        externalApy.apy === null
          ? null
          : Big(externalApy.apy).times(proportion).toNumber()

      underlyingAssetsApyData.push({
        id,
        apyType: externalApy.apyType,
        supplyApy: apy,
        borrowApy: apy,
      })
    }
  }

  const incentivesNetAPR = calculateIncentivesNetAPR(allIncentives)

  return {
    assetId,
    incentives: allIncentives.filter(({ incentiveAPR }) =>
      Big(incentiveAPR).gt(0),
    ),
    lpAPY,
    stablepoolData,
    underlyingAssetsApyData,
    incentivesNetAPR,
    ...calculateTotalSupplyAndBorrowApy(
      underlyingAssetsApyData,
      incentivesNetAPR,
      lpAPY ?? 0,
    ),
  }
}
