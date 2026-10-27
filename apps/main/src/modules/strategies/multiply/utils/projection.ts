import Big from "big.js"
import { formatUnits, parseUnits } from "viem"

// Mirrors LooperFactory.maxLeverage: min(minHf / (minHf − LT), 1 / (1 − LTV)).
export const getMaxLeverage = ({
  lt,
  ltv,
  minHf,
}: {
  lt: number
  ltv: number
  minHf: number
}) => {
  if (lt <= 0 || ltv <= 0 || lt >= minHf || ltv >= 1) return 0
  return Math.min(minHf / (minHf - lt), 1 / (1 - ltv))
}

// Floors to 0.1×. The epsilon keeps 1.10 / 0.22 (= 4.999…) at 5.0.
export const getSliderMaxLeverage = (maxLeverage: number) =>
  Math.floor(maxLeverage * 10 + 1e-9) / 10

// Mirrors LooperLogic._deployHf: the HF the ramp deploys to.
export const getDeployHealthFactor = (
  lt: number,
  minHf: number,
  leverage: number,
) => Math.max((lt * leverage) / (leverage - 1), minHf)

export type MultiplyProjectionInput = {
  amount: number
  collateralPriceUsd: number
  debtPriceUsd: number
  leverage: number
  lt: number
  minHf: number
  supplyApy: number
  borrowApy: number
}

export const projectMultiplyPosition = ({
  amount,
  collateralPriceUsd,
  debtPriceUsd,
  leverage,
  lt,
  minHf,
  supplyApy,
  borrowApy,
}: MultiplyProjectionInput) => {
  const equityUsd = amount * collateralPriceUsd
  const debtUsd = equityUsd * (leverage - 1)
  const healthFactor = getDeployHealthFactor(lt, minHf, leverage)

  return {
    collateral: amount * leverage,
    collateralUsd: equityUsd * leverage,
    debt: debtPriceUsd > 0 ? debtUsd / debtPriceUsd : 0,
    debtUsd,
    healthFactor,
    // collateral price (debt price held fixed) at which HF reaches 1
    liquidationPriceUsd: collateralPriceUsd / healthFactor,
    netApy: leverage * supplyApy - (leverage - 1) * borrowApy,
  }
}

// Ramp rung count from the ladder's geometric sizing: each rung borrows k of
// the previous gap, k = LT / deployHf, and the ramp stops once a rung would fall
// under the intent floor (a share of the deposit). fillRatio is the fair value a
// fill delivers.
export const estimateRampRungs = ({
  leverage,
  lt,
  minHf,
  floorShare = 0.01,
  fillRatio = 0.995,
}: {
  leverage: number
  lt: number
  minHf: number
  floorShare?: number
  fillRatio?: number
}) => {
  if (leverage <= 1) return 0
  const k = lt / getDeployHealthFactor(lt, minHf, leverage)
  return Math.floor(Math.log(floorShare / k) / Math.log(k * fillRatio)) + 1
}

const ONE_PERCENT = 0.01

// minIntentDebt / minIntentAToken for `open`: max(2 × ED, 1% of the deposit),
// each in its own leg's base units. The aToken is 1:1 with the collateral.
export const getIntentFloors = ({
  amount,
  collateralDecimals,
  debtDecimals,
  collateralPriceInDebt,
  debtEd,
  aCollateralEd,
}: {
  amount: bigint
  collateralDecimals: number
  debtDecimals: number
  collateralPriceInDebt: number
  debtEd: bigint
  aCollateralEd: bigint
}) => {
  const shareOfDeposit = Big(formatUnits(amount, collateralDecimals)).times(
    ONE_PERCENT,
  )
  const aTokenShare = parseUnits(
    shareOfDeposit.toFixed(collateralDecimals, Big.roundDown),
    collateralDecimals,
  )
  const debtShare = parseUnits(
    shareOfDeposit
      .times(collateralPriceInDebt)
      .toFixed(debtDecimals, Big.roundDown),
    debtDecimals,
  )
  const max = (a: bigint, b: bigint) => (a > b ? a : b)

  return {
    minIntentDebt: max(2n * debtEd, debtShare),
    minIntentAToken: max(2n * aCollateralEd, aTokenShare),
  }
}
