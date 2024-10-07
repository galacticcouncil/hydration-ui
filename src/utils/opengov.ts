import BigNumber from "bignumber.js"
import { TReferenda } from "api/democracy"
import { BN_0 } from "./constants"

export const getCurveData = (
  track: TReferenda,
  field: "minApproval" | "minSupport",
) => {
  const curve = track[field]

  if (!curve) {
    return null
  }

  if (curve.isReciprocal) {
    const { factor, xOffset, yOffset } = curve.asReciprocal
    return makeReciprocalCurve(
      factor.toString(),
      xOffset.toString(),
      yOffset.toString(),
    )
  }

  if (curve.isLinearDecreasing) {
    const { length, floor, ceil } = curve.asLinearDecreasing

    return makeLinearCurve(length.toNumber(), floor.toNumber(), ceil.toNumber())
  }

  return null
}

export const makeReciprocalCurve = (
  factor: string,
  xOffset: string,
  yOffset: string,
) => {
  return (percentage: number) => {
    const x = percentage * Math.pow(10, 9)

    const v = new BigNumber(factor)
      .div(new BigNumber(x).plus(xOffset))
      .multipliedBy(Math.pow(10, 9))
      .toFixed(0, BigNumber.ROUND_DOWN)

    const calcValue = new BigNumber(v)
      .plus(yOffset)
      .div(Math.pow(10, 9))
      .toString()
    return BigNumber.max(calcValue, 0).toString()
  }
}

export const makeLinearCurve = (
  length: number,
  floor: number,
  ceil: number,
) => {
  return (percentage: number) => {
    const x = percentage * Math.pow(10, 9)

    const xValue = BigNumber.min(x, length)

    const slope = new BigNumber(ceil).minus(floor).dividedBy(length)
    const deducted = slope.multipliedBy(xValue).toString()

    const perbill = new BigNumber(ceil)
      .minus(deducted)
      .toFixed(0, BigNumber.ROUND_DOWN)
    const calcValue = new BigNumber(perbill).div(Math.pow(10, 9)).toString()
    return BigNumber.max(calcValue, 0).toString()
  }
}

export const getDecidingEndPercentage = (
  decisionPeriod: string,
  decidingSince: string | undefined,
  endHeight: string,
) => {
  if (decidingSince === undefined) return BN_0

  const gone = BigNumber(endHeight).minus(decidingSince)

  return BigNumber.min(gone.div(decisionPeriod), 1)
}
