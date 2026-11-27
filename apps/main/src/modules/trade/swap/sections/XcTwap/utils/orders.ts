import { BLOCK_TIME_MS, MIN_TWAP_PERIOD } from "@galacticcouncil/xc-intents"

import type { DcaOrdersMode } from "@/modules/trade/swap/sections/DCA/useDcaForm"

export const XC_TWAP_MIN_ORDERS = 3

const MIN_PERIOD_MS = MIN_TWAP_PERIOD * BLOCK_TIME_MS

type XcOrdersMode = `${DcaOrdersMode.Auto | DcaOrdersMode.Custom}`

const getBudgetLimit = (amountIn: bigint, leastIn: bigint) =>
  leastIn > 0n ? Number(amountIn / leastIn) : Infinity

export const getXcTranches = ({
  mode,
  custom,
  suggested,
  amountIn,
  leastIn,
}: {
  mode: XcOrdersMode
  custom: number
  suggested: number
  amountIn: bigint
  leastIn: bigint
}) =>
  mode === "Custom"
    ? custom
    : Math.min(suggested, getBudgetLimit(amountIn, leastIn))

export const getXcPeriod = (durationMs: number, tranches: number) =>
  Math.max(MIN_TWAP_PERIOD, Math.floor(durationMs / BLOCK_TIME_MS / tranches))

export const getXcMaxOrders = (
  durationMs: number,
  amountIn: bigint,
  leastIn: bigint,
) =>
  Math.min(
    Math.floor(durationMs / MIN_PERIOD_MS),
    getBudgetLimit(amountIn, leastIn),
  )

export const getXcMinBudget = (leastIn: bigint) =>
  BigInt(XC_TWAP_MIN_ORDERS) * leastIn

/**
 * `leastIn` is the per-order minimum at the quoted price, but xc-intents checks
 * it against the order's output after slippage (`minWethOut`), so the input
 * has to cover the slippage too: leastIn / (1 − slippage), rounded up.
 */
export const getXcLeastInAfterSlippage = (
  leastIn: bigint,
  slippagePct: number,
) => {
  const kept = 10_000n - BigInt(Math.round(slippagePct * 100))

  return kept > 0n ? (leastIn * 10_000n + kept - 1n) / kept : leastIn
}
