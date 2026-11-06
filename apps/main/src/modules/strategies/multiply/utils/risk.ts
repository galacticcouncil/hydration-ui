export type RiskLevel = "low" | "medium" | "high"

const DAY_S = 24 * 60 * 60
// a 30-day window of hourly candles spans just under 30 days
const MIN_HISTORY_S = 29 * DAY_S

export type PriceRatioPoint = { time: number; ratio: number }

/** The price move, as a share, that takes a position from health factor `hf` to 1. */
export const getLiquidationBuffer = (hf: number) => 1 - 1 / hf

/**
 * The largest fall of the collateral/debt ratio from its running peak, as a
 * share, and the span of history it covers. Null with fewer than two points.
 */
export const getLargestFall = (points: PriceRatioPoint[]) => {
  if (points.length < 2) return null

  let peak = 0
  let fall = 0
  for (const { ratio } of points) {
    peak = Math.max(peak, ratio)
    if (peak > 0) fall = Math.max(fall, 1 - ratio / peak)
  }

  return { fall, spanS: points.at(-1)!.time - points[0]!.time }
}

/**
 * Correlated loops are Low. Volatile loops are Medium when the largest 30-day
 * fall stays under a third of the liquidation buffer over a full window, else
 * High (including when history is missing or short).
 */
export const getRiskLevel = ({
  correlated,
  largestFall,
  hf,
}: {
  correlated: boolean
  largestFall: ReturnType<typeof getLargestFall>
  hf: number
}): RiskLevel => {
  if (correlated) return "low"
  if (!largestFall || largestFall.spanS < MIN_HISTORY_S) return "high"
  return largestFall.fall < getLiquidationBuffer(hf) / 3 ? "medium" : "high"
}

/**
 * Collateral/debt ratio from two series priced in the same quote asset,
 * matched by candle time.
 */
export const toPriceRatios = (
  collateral: { time: number; close: number }[],
  debt: { time: number; close: number }[],
): PriceRatioPoint[] => {
  const debtByTime = new Map(debt.map((c) => [c.time, c.close]))
  return collateral.flatMap(({ time, close }) => {
    const d = debtByTime.get(time)
    return d ? [{ time, ratio: close / d }] : []
  })
}
