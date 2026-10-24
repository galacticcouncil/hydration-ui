import { useEffect, useState } from "react"

import { useMoneyMarket } from "@/react/provider"

const unixNow = () => Math.floor(Date.now() / 1000)

/**
 * The timestamp every derivation in the react layer is evaluated against, in
 * unix seconds, advanced every `tickInterval` milliseconds.
 *
 * This is the one place in the package that reads a clock (ADR-0004): `core` is
 * pure and takes a timestamp, so the clock has to live at the edge, and this is
 * the edge. The value it returns is deliberately *not* a cache dimension — it
 * never reaches a query key, so a tick re-runs the memo that derives over
 * already-cached chain state and issues no request.
 *
 * Interest accrues continuously, so between two chain reads the last payload
 * still tells the truth as long as it is accrued forward. Ticking is what makes
 * a stale payload keep reading correctly rather than a reason to fetch again.
 */
export const useTick = (): number => {
  const { tickInterval } = useMoneyMarket()
  const [timestamp, setTimestamp] = useState(unixNow)

  useEffect(() => {
    const id = setInterval(() => setTimestamp(unixNow()), tickInterval)

    return () => clearInterval(id)
  }, [tickInterval])

  return timestamp
}
