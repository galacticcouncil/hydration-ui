import { useBestNumber } from "api/chain"
import { useMemo } from "react"
import { getCurveData, getDecidingEndPercentage } from "utils/opengov"
import BN from "bignumber.js"
import { PalletReferendaReferendumStatus } from "@polkadot/types/lookup"
import { BN_0, BN_NAN } from "utils/constants"
import { isNil } from "utils/helpers"
import { TReferenda } from "api/democracy"

export const getPerbillPercentage = (perbill = 0) => {
  if (isNil(perbill) || perbill <= 0) {
    return "0.0%"
  }

  const precision = perbill > 10 * Math.pow(10, 7) ? 1 : 2
  return ((perbill / Math.pow(10, 9)) * 100).toFixed(precision) + "%"
}

export const useMinApprovalThreshold = (
  track: TReferenda,
  referenda: PalletReferendaReferendumStatus,
) => {
  const { data: blockNumbers } = useBestNumber()
  const blockNumber = blockNumbers?.parachainBlockNumber
    .toBigNumber()
    // basilisk block number calculated from hydra nice rpc
    .plus(859253)
    .toString()

  return useMemo(() => {
    if (track && blockNumber) {
      const decidingSince = referenda.deciding.unwrapOr(null)?.since.toString()

      const percentage = getDecidingEndPercentage(
        track.decisionPeriod.toString(),
        decidingSince,
        blockNumber,
      )

      const getApprovalThreshold = getCurveData(track, "minApproval")

      return BN(getApprovalThreshold?.(percentage.toNumber()) ?? BN_NAN).times(
        100,
      )
    }
  }, [track, blockNumber, referenda])
}

export const useReferendaVotes = (
  referenda: PalletReferendaReferendumStatus,
) => {
  return useMemo(() => {
    if (!referenda)
      return { ayes: BN_0, nays: BN_0, percAyes: BN_0, percNays: BN_0 }

    const ayes = referenda.tally.ayes.toBigNumber().shiftedBy(-12)
    const nays = referenda.tally.nays.toBigNumber().shiftedBy(-12)

    const votesSum = ayes.plus(nays)

    let percAyes = BN_0
    let percNays = BN_0

    if (!votesSum.isZero()) {
      percAyes = ayes.div(votesSum).times(100)
      percNays = nays.div(votesSum).times(100)
    }

    return { ayes, nays, percAyes, percNays }
  }, [referenda])
}

export const useSupportThreshold = (
  track: TReferenda,
  referenda: PalletReferendaReferendumStatus,
  issuance: string,
) => {
  const { data: blockNumbers } = useBestNumber()
  const blockNumber = blockNumbers?.parachainBlockNumber
    .toBigNumber()
    // basilisk block number calculated from hydra nice rpc
    .plus(859253)
    .toString()

  const support = useMemo(
    () =>
      BN(referenda.tally.support.toString())
        .div(issuance)
        .multipliedBy(Math.pow(10, 9))
        .toNumber(),
    [issuance, referenda.tally.support],
  )

  const supportThreshold = useMemo(() => {
    if (track && blockNumber) {
      const decidingSince = referenda.deciding.unwrapOr(null)?.since.toString()

      const percentage = getDecidingEndPercentage(
        track.decisionPeriod.toString(),
        decidingSince,
        blockNumber,
      )

      const getApprovalThreshold = getCurveData(track, "minSupport")

      return BN(getApprovalThreshold?.(percentage.toNumber()) ?? BN_NAN)
    }
  }, [track, blockNumber, referenda])

  const threshold = useMemo(
    () => supportThreshold?.shiftedBy(9),
    [supportThreshold],
  )

  const maxSupportBarValue = useMemo(
    () =>
      BN.max(support, threshold?.toNumber() ?? 0)
        .multipliedBy(1.25)
        .toNumber(),
    [support, threshold],
  )

  const barPercentage = useMemo(() => {
    if (!support || !maxSupportBarValue) {
      return 0
    }

    // when the decision period reach end, we show 100% for support bar,
    // because support threshold require 0% at the end
    if (maxSupportBarValue <= 0) {
      return 100
    }

    return BN(support).div(maxSupportBarValue).times(100).toNumber()
  }, [support, maxSupportBarValue])

  const markPercentage = useMemo(() => {
    if (!maxSupportBarValue || !threshold) {
      return 0
    }

    return threshold.div(maxSupportBarValue).times(100).toNumber()
  }, [threshold, maxSupportBarValue])

  return {
    support,
    supportThreshold,
    threshold,
    maxSupportBarValue,
    barPercentage,
    markPercentage,
  }
}
