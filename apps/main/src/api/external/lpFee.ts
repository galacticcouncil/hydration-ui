import Big from "big.js"

import {
  assertPlausibleApy,
  EXTERNAL_APY_MAX_AGE_MS,
} from "@/api/external/reading"

/** The fields of a `stablepoolYieldMetricsQuery` item the LP fee rule reads. */
export type LpFeeYieldMetric = {
  poolId: string
  feeApyPerc: string | null
  asOf: string | null
}

export type LpFeeReadingStatus =
  | { status: "known"; apy: string }
  | { status: "loading" }
  | { status: "unavailable" }

/**
 * Usability rule for a stablepool's LP fee APY, read from the shared yield
 * metrics response. The response is judged like any external APY reading: by
 * `data` alone and by its own `asOf`, not by fetch time. In a usable response
 * a null, zero or absent pool is an LP fee of 0 by decision, a softening of
 * the general rule; an unusable response is unavailable for every pool.
 */
export const lpFeeReading = (
  {
    data,
    isPending,
  }: { data: ReadonlyArray<LpFeeYieldMetric> | undefined; isPending: boolean },
  poolId: string,
  now: number,
): LpFeeReadingStatus => {
  // every item carries the response's `asOf`
  const asOf = Date.parse(data?.[0]?.asOf ?? "")

  if (!data || !(now - asOf <= EXTERNAL_APY_MAX_AGE_MS)) {
    return isPending ? { status: "loading" } : { status: "unavailable" }
  }

  const feeApyPerc = data.find((item) => item.poolId === poolId)?.feeApyPerc

  if (feeApyPerc === null || feeApyPerc === undefined) {
    return { status: "known", apy: "0" }
  }

  try {
    return {
      status: "known",
      apy: assertPlausibleApy(
        Big(feeApyPerc).div(100).toFixed(),
        `yieldMetrics:${poolId}`,
      ),
    }
  } catch {
    return { status: "unavailable" }
  }
}
