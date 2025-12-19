import { expose } from "comlink"

const MAX_POINTS = 100

export const worker = {
  getLoyaltyFactor(
    plannedYieldingPeriods: number,
    initialRewardPercentage: number,
    scaleCoef: number,
    periodsInFarm: number | undefined,
  ) {
    const result: { rate: number; current: boolean; period: number }[] = []
    let isCurrent = false

    const gap = Math.floor(plannedYieldingPeriods / MAX_POINTS)
    const periods = Array.from({ length: MAX_POINTS + 1 }, (_, i) => i * gap)

    periods.forEach((period, index) => {
      const tau = period / ((initialRewardPercentage + 1) * scaleCoef)
      const tauAddTauMulInitialRewardPercentage =
        tau + tau * initialRewardPercentage

      const num = tauAddTauMulInitialRewardPercentage + initialRewardPercentage
      const denom = tauAddTauMulInitialRewardPercentage + 1

      const rate = Math.min(1, num / denom) * 100

      let current = false
      const nextPeriod = periods[index + 1]

      if (periodsInFarm && !isCurrent) {
        if (!nextPeriod) {
          current = true
        } else {
          current = nextPeriod > periodsInFarm && periodsInFarm >= period
        }
      }

      if (current) isCurrent = true

      result.push({
        rate,
        period,
        current,
      })
    })

    return result
  },
}

expose(worker)
