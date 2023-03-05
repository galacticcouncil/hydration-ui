import { expose } from "comlink"

export const worker = {
  getLoyaltyFactor(
    plannedYieldingPeriods: number,
    initialRewardPercentage: number,
    scaleCoef: number,
    periodsInFarm: number | undefined,
    axisScale: number,
  ) {
    const result = []

    for (let periods = 0; periods <= plannedYieldingPeriods; periods++) {
      //reduce the number of periods by taking one period each axisScale periods
      if (
        periods % axisScale !== 0 &&
        periods !== periodsInFarm &&
        periods !== plannedYieldingPeriods
      )
        continue

      const tau = periods / ((initialRewardPercentage + 1) * scaleCoef)
      const tauAddTauMulInitialRewardPercentage =
        tau + tau * initialRewardPercentage

      const num = tauAddTauMulInitialRewardPercentage + initialRewardPercentage
      const denom = tauAddTauMulInitialRewardPercentage + 1

      const rate = Math.min(1, num / denom) * 100
      const currentLoyalty = periodsInFarm
        ? periods === periodsInFarm ||
          (periods === plannedYieldingPeriods && periods < periodsInFarm)
        : false

      result.push({
        rate,
        currentLoyalty,
      })
    }

    return result
  },
}

expose(worker)
