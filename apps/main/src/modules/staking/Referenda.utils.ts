import Big from "big.js"
import { useTranslation } from "react-i18next"

import { ReferendaTrack } from "@/api/constants"
import { OngoingGovReferenda } from "@/api/democracy"

export const useReferendaState = (referenda: OngoingGovReferenda): string => {
  const { t } = useTranslation(["staking"])

  const deciding = referenda.deciding

  switch (true) {
    case !referenda.decision_deposit || !deciding:
      return t("referenda.state.preparing")
    case !deciding?.confirming:
      return t("referenda.state.deciding")
    default:
      return t("referenda.state.confirming")
  }
}

export const ginApprovalThreshold = (
  track: ReferendaTrack | undefined,
  referenda: OngoingGovReferenda,
  blockNumber: number | undefined,
): number => {
  if (!track || !blockNumber) {
    return 0
  }

  const decidingSince = referenda.deciding?.since

  const percentage = getDecidingEndPercentage(
    track.decision_period,
    decidingSince,
    blockNumber,
  )

  const getApprovalThreshold = getCurveData(track, "min_approval")

  return Big(getApprovalThreshold?.(percentage) ?? 0)
    .times(100)
    .toNumber()
}

const getCurveData = (
  track: ReferendaTrack,
  field: Extract<keyof ReferendaTrack, "min_approval" | "min_support">,
) => {
  const curve = track[field]

  if (!curve) {
    return null
  }

  if (curve.type === "Reciprocal") {
    const { factor, x_offset, y_offset } = curve.value
    return makeReciprocalCurve(factor, x_offset, y_offset)
  }

  if (curve.type === "LinearDecreasing") {
    const { length, floor, ceil } = curve.value

    return makeLinearCurve(length, floor, ceil)
  }

  return null
}

const makeReciprocalCurve = (
  factor: bigint,
  xOffset: bigint,
  yOffset: bigint,
) => {
  return (percentage: number) => {
    const x = percentage * Math.pow(10, 9)

    const v = Big(factor.toString())
      .div(Big(x).plus(xOffset.toString()))
      .mul(Math.pow(10, 9))
      .toFixed(0, Big.roundDown)

    const calcValue = Big(v)
      .plus(yOffset.toString())
      .div(Math.pow(10, 9))
      .toString()
    return Big.max(calcValue, 0).toString()
  }
}

const makeLinearCurve = (length: number, floor: number, ceil: number) => {
  return (percentage: number) => {
    const x = percentage * Math.pow(10, 9)

    const xValue = Big.min(x, length)

    const slope = Big(ceil).minus(floor).div(length)
    const deducted = slope.mul(xValue)

    const perbill = Big(ceil).minus(deducted).toFixed(0, Big.roundDown)
    const calcValue = Big(perbill).div(Math.pow(10, 9))
    return Big.max(calcValue, 0).toString()
  }
}

const getDecidingEndPercentage = (
  decisionPeriod: number,
  decidingSince: number | undefined,
  endHeight: number,
): number => {
  if (decidingSince === undefined) {
    return 0
  }

  const gone = Big(endHeight).minus(decidingSince)

  return Big.min(gone.div(decisionPeriod), 1).toNumber()
}

export const getPerbillPercentage = (perbill = 0): number => {
  if (!perbill || perbill <= 0) {
    return 0
  }

  return (perbill / Math.pow(10, 9)) * 100
}

export const getSupportThreshold = (
  track: ReferendaTrack | undefined,
  referenda: OngoingGovReferenda,
  issuance: bigint,
  blockNumber: number | undefined,
) => {
  const support =
    issuance === 0n
      ? 0
      : Big(referenda.tally.support.toString())
          .div(issuance.toString())
          .mul(Math.pow(10, 9))
          .toNumber()

  const threshold = (() => {
    if (!track || !blockNumber) {
      return undefined
    }

    const decidingSince = referenda.deciding?.since

    const percentage = getDecidingEndPercentage(
      track.decision_period,
      decidingSince,
      blockNumber,
    )

    const getApprovalThreshold = getCurveData(track, "min_support")

    return Big(getApprovalThreshold?.(percentage) ?? 0)?.times(Math.pow(10, 9))
  })()

  const maxSupportBarValue = Big.max(support, threshold?.toNumber() ?? 0)
    .mul(1.25)
    .toNumber()

  const barPercentage = (() => {
    if (!support || !maxSupportBarValue) {
      return 0
    }

    // when the decision period reach end, we show 100% for support bar,
    // because support threshold require 0% at the end
    if (maxSupportBarValue <= 0) {
      return 100
    }

    return Big(support).div(maxSupportBarValue).times(100).toNumber()
  })()

  const markPercentage = (() => {
    if (!maxSupportBarValue || !threshold) {
      return 0
    }

    return threshold.div(maxSupportBarValue).times(100).toNumber()
  })()

  return {
    support,
    threshold: threshold?.toNumber(),
    maxSupportBarValue,
    barPercentage,
    markPercentage,
  }
}
