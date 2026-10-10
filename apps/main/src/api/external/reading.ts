import Big from "big.js"
import { millisecondsInWeek } from "date-fns/constants"

/** An external APY as a fraction (decimal string) and the epoch ms it is for. */
export type ExternalApyReading = { apy: string; asOf: number }

export type ExternalApyReadingStatus =
  | { status: "known"; reading: ExternalApyReading }
  | { status: "loading" }
  | { status: "unavailable" }

export const EXTERNAL_APY_MAX_AGE_MS = millisecondsInWeek
export const EXTERNAL_APY_MAX = "1"

/**
 * Sanity bound shared by every external APY source: the fraction must be
 * finite, at least 0 and at most `EXTERNAL_APY_MAX`. Anything else is logged
 * and thrown, never shown.
 */
export const assertPlausibleApy = (
  value: number | string,
  source: string,
): string => {
  const fraction =
    typeof value === "string" && value.trim() === "" ? NaN : Number(value)

  if (
    !Number.isFinite(fraction) ||
    fraction < 0 ||
    fraction > Number(EXTERNAL_APY_MAX)
  ) {
    console.error(`Implausible external APY from ${source}`, value)
    throw new Error(`Implausible external APY from ${source}: ${value}`)
  }

  return Big(value).toFixed()
}

export const newestBy = <T>(
  entries: ReadonlyArray<T>,
  getTime: (entry: T) => number,
): T | undefined => {
  let newest: T | undefined
  let newestTime = -Infinity

  for (const entry of entries) {
    const time = getTime(entry)

    if (newest === undefined || time > newestTime) {
      newest = entry
      newestTime = time
    }
  }

  return newest
}

/**
 * Usability rule for an external APY query result. Age is measured from the
 * reading's own `asOf`, not from fetch time, and judged on `data` alone: a
 * failed refetch keeps the last known value until it passes the max age.
 */
export const readingStatus = (
  {
    data,
    isPending,
  }: { data: ExternalApyReading | undefined; isPending: boolean },
  now: number,
): ExternalApyReadingStatus => {
  if (data && now - data.asOf <= EXTERNAL_APY_MAX_AGE_MS) {
    return { status: "known", reading: data }
  }

  return isPending ? { status: "loading" } : { status: "unavailable" }
}
