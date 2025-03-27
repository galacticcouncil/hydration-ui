import { valueToBigNumber } from "@aave/math-utils"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

export const useStrategyData = (assetId: string) => {
  const { user } = useAppDataContext()
  const { userReservesData } = user

  const assetSupply = userReservesData.find(
    (reserve) => mapAssetId(reserve.underlyingAsset) === assetId,
  )

  const incentives = assetSupply?.reserve.aIncentivesData ?? []

  const isIncentivesInfinity = incentives.some(
    (incentive) => incentive.incentiveAPR === "Infinity",
  )
  const incentivesAPRSum = isIncentivesInfinity
    ? Infinity
    : incentives.reduce(
        (aIncentive, bIncentive) => aIncentive + +bIncentive.incentiveAPR,
        0,
      )

  const incentivesNetAPR = isIncentivesInfinity
    ? Infinity
    : incentivesAPRSum !== Infinity
      ? valueToBigNumber(incentivesAPRSum || 0).toNumber()
      : Infinity

  return {
    tvl: assetSupply?.underlyingBalanceUSD || "0",
    apr: incentivesNetAPR === Infinity ? Infinity : incentivesNetAPR * 100,
  }
}

const mapAssetId = (assetId: string): string =>
  Number("0x" + assetId.replace(/^0x/, "").replace(/^[01]*/, "")).toString()
