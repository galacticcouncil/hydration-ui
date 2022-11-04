import { expose } from "comlink"

// If 99% and more, exit the loop prematurely
const EPS = 1

export const worker = {
  getLoyaltyFactor(
    plannedYieldingPeriods: number,
    initialRewardPercentage: number,
    scaleCoef: number,
  ) {
    const result = []
    for (let periods = 0; periods < plannedYieldingPeriods; periods++) {
      const tau = periods / ((initialRewardPercentage + 1) * scaleCoef)
      const tauAddTauMulInitialRewardPercentage =
        tau + tau * initialRewardPercentage

      const num = tauAddTauMulInitialRewardPercentage + initialRewardPercentage
      const denom = tauAddTauMulInitialRewardPercentage + 1

      const rate = Math.min(1, num / denom) * 100

      if (Math.abs(100 - rate) < EPS) {
        break
      }
      result.push(rate)
    }

    return result
  },
}

expose(worker)
