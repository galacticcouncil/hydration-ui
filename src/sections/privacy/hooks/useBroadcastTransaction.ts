// Phase 5d — `useBroadcastTransaction` hook.
//
// Returns a single function: `(signedTx, selfRelay?) => Promise<txHash>`.
// The send / unshield / swap flows call this instead of pushing to the user's
// EVM signer themselves, so swapping in a real waku broadcaster (Phase 3+)
// doesn't touch any flow code.
//
// Self-relay fallback: when there's no broadcaster picked OR no broadcasters
// online, callers pass a `selfRelay` thunk that sends the tx through the
// user's connected wallet. The hook returns the tx hash either way so the
// flow doesn't have to branch on transport.

import { useCallback } from "react"

import { useBroadcasterContext } from "sections/privacy/providers/BroadcasterProvider"

export type UseBroadcastTransaction = (args: {
  signedTx: string
  /** Falls back to the user's wallet sendTransaction when no broadcaster. */
  selfRelay?: () => Promise<string>
}) => Promise<string>

export const useBroadcastTransaction = (): UseBroadcastTransaction => {
  const { broadcastTransaction } = useBroadcasterContext()
  return useCallback<UseBroadcastTransaction>(
    async ({ signedTx, selfRelay }) => {
      const { txHash } = await broadcastTransaction({ signedTx, selfRelay })
      return txHash
    },
    [broadcastTransaction],
  )
}
