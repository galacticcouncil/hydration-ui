import { bigShift } from "@galacticcouncil/utils"
import Big, { BigSource } from "big.js"

const RAY = Big(10).pow(27)
const HALF_RAY = RAY.div(2)

const rayMul = (a: BigSource, b: BigSource): Big =>
  HALF_RAY.plus(Big(a).times(b)).div(RAY)

const rayDiv = (a: BigSource, b: BigSource): Big => {
  const halfB = Big(b).div(2)
  return halfB.plus(Big(a).times(RAY)).div(b)
}

export type InterestRateModelOpts = {
  variableRateSlope1: string
  variableRateSlope2: string
  stableRateSlope1: string
  stableRateSlope2: string
  stableBorrowRateEnabled?: boolean
  optimalUsageRatio: string
  utilizationRate: string
  baseVariableBorrowRate: string
  baseStableBorrowRate: string
  totalLiquidityUSD: string
  totalDebtUSD: string
}

type Rate = {
  stableRate: number
  variableRate: number
  utilization: number
}

const resolution = 200
const step = 100 / resolution

export const getInterestRates = ({
  variableRateSlope1,
  variableRateSlope2,
  stableRateSlope1,
  stableRateSlope2,
  optimalUsageRatio,
  baseVariableBorrowRate,
  baseStableBorrowRate,
}: InterestRateModelOpts): Rate[] => {
  const rates: Rate[] = []
  const formattedOptimalUtilizationRate = bigShift(
    optimalUsageRatio,
    -25,
  ).toNumber()

  for (let i = 0; i <= resolution; i++) {
    const utilization = i * step
    // When zero
    if (utilization === 0) {
      rates.push({
        stableRate: 0,
        variableRate: 0,
        utilization,
      })
    }
    // When hovering below optimal utilization rate, actual data
    else if (utilization < formattedOptimalUtilizationRate) {
      const theoreticalStableAPY = bigShift(
        Big(baseStableBorrowRate).plus(
          rayDiv(
            rayMul(stableRateSlope1, bigShift(utilization, 25)),
            optimalUsageRatio,
          ),
        ),
        -27,
      ).toNumber()
      const theoreticalVariableAPY = bigShift(
        Big(baseVariableBorrowRate).plus(
          rayDiv(
            rayMul(variableRateSlope1, bigShift(utilization, 25)),
            optimalUsageRatio,
          ),
        ),
        -27,
      ).toNumber()
      rates.push({
        stableRate: theoreticalStableAPY,
        variableRate: theoreticalVariableAPY,
        utilization,
      })
    }
    // When hovering above optimal utilization rate, hypothetical predictions
    else {
      const excess = rayDiv(
        bigShift(utilization, 25).minus(optimalUsageRatio),
        RAY.minus(optimalUsageRatio),
      )
      const theoreticalStableAPY = bigShift(
        Big(baseStableBorrowRate)
          .plus(stableRateSlope1)
          .plus(rayMul(stableRateSlope2, excess)),
        -27,
      ).toNumber()
      const theoreticalVariableAPY = bigShift(
        Big(baseVariableBorrowRate)
          .plus(variableRateSlope1)
          .plus(rayMul(variableRateSlope2, excess)),
        -27,
      ).toNumber()
      rates.push({
        stableRate: theoreticalStableAPY,
        variableRate: theoreticalVariableAPY,
        utilization,
      })
    }
  }
  return rates
}
