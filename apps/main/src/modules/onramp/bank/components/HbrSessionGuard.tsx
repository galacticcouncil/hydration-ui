import { useAccount } from "@galacticcouncil/web3-connect"
import { FC, useEffect, useRef } from "react"

import { useHbrClearSession } from "@/modules/onramp/bank/hooks/useHbr"

/**
 * Ends the bank session when the connected wallet goes away or changes, with
 * or without a bank screen mounted (API doc 2 step 1: clear the stored entry
 * when the connected wallet differs from the session's). Mounted once at the
 * app root. On a disconnect, and on any change from one account to another,
 * it clears the session in memory and in sessionStorage and removes every HBR
 * query, so the next bank screen asks for a new sign-in. The first account
 * after a page load (null, then the reconnected wallet) is not a change: a
 * reload in the same tab keeps its session (owner decision 2026-11-13). The
 * server token is not revoked here (no DELETE); it ends at its expiry.
 */
export const HbrSessionGuard: FC = () => {
  const { account } = useAccount()
  const clearSession = useHbrClearSession()
  const current = account?.address ?? null
  const last = useRef<string | null>(null)

  useEffect(() => {
    const previous = last.current
    last.current = current
    if (previous === null || previous === current) return
    clearSession()
  }, [current, clearSession])

  return null
}
