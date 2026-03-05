import Big from "big.js"

import {
  DOT_ASSET_ID,
  ETH_ASSET_ID,
  GDOT_STABLESWAP_ASSET_ID,
  GETH_STABLESWAP_ASSET_ID,
} from "@/ui-config/misc"

const MAX_STEPS = 50

const MAX_LTV = 1.0
const MAX_MULTIPLIER = 8

const MIN_LTV = 0.7
const MIN_MULTIPLIER = 2

const HF_SQUEEZE_SAFETY_MARGIN = 0.9

export type LoopingStep = { supply: Big; borrow: Big }

export const LOOPING_ASSET_PAIRS: Record<string, string> = {
  [GDOT_STABLESWAP_ASSET_ID]: DOT_ASSET_ID,
  [GETH_STABLESWAP_ASSET_ID]: ETH_ASSET_ID,
}

export function getMaxMultiplierFromLtv(ltv: number): number {
  if (ltv < MIN_LTV || ltv > MAX_LTV) return 0

  const slope = (MAX_MULTIPLIER - MIN_MULTIPLIER) / (MAX_LTV - MIN_LTV)
  const intercept = MAX_MULTIPLIER - slope * MAX_LTV

  return Math.max(0, Math.floor(slope * ltv + intercept))
}

export function getLoopingSteps({
  initialAmount,
  multiplier,
  ltv,
}: {
  initialAmount: string
  multiplier: number
  ltv: string
}): LoopingStep[] {
  const amount = new Big(initialAmount)
  const targetSupply = amount.times(multiplier)

  const steps: LoopingStep[] = [{ supply: amount, borrow: Big(0) }]

  let totalSupply = amount
  let i = 0
  while (totalSupply.lt(targetSupply) && i < MAX_STEPS) {
    const prev = steps[steps.length - 1]
    const supply = prev.supply.times(ltv)
    const borrow = supply

    totalSupply = totalSupply.plus(supply)
    const diffToTarget = totalSupply.minus(targetSupply)

    steps.push({
      supply: diffToTarget.gt(0) ? supply.minus(diffToTarget) : supply,
      borrow,
    })
    i++
  }

  const lastStep = steps[steps.length - 1]

  // final step to squeeze Health Factor with some safety margin
  const squeezeHfStep: LoopingStep = {
    supply: Big(0),
    borrow: lastStep.supply.times(ltv).times(HF_SQUEEZE_SAFETY_MARGIN),
  }

  return [...steps, squeezeHfStep]
}
