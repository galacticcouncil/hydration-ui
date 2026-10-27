import Big from "big.js"

/** moves within this are ordinary drift and apply at once */
const DRIFT = 0.001

type RateState = {
  stable: string
  candidate?: string
  candidateAt?: number
}

const states = new Map<string, RateState>()

/**
 * The SDK spot rate (2-Pool-GETH -> ETH) jumps for single blocks to a stale
 * route value and back, so every ETH amount flickers ~0.1%. A jump beyond
 * ordinary drift only applies once a second, separate fetch confirms it.
 */
export const stabilizeRate = (
  key: string,
  value: string,
  fetchedAt: number,
): string => {
  const state = states.get(key)
  if (!state) {
    states.set(key, { stable: value })
    return value
  }
  const near = (a: string, b: string) =>
    Big(a).minus(b).abs().lte(Big(b).times(DRIFT))
  if (near(value, state.stable)) {
    states.set(key, { stable: value })
  } else if (
    state.candidate !== undefined &&
    state.candidateAt !== fetchedAt &&
    near(value, state.candidate)
  ) {
    states.set(key, { stable: value })
  } else if (state.candidateAt !== fetchedAt) {
    states.set(key, { ...state, candidate: value, candidateAt: fetchedAt })
  }
  return states.get(key)!.stable
}

/** test hook */
export const resetStableRates = () => states.clear()
