import { minutesToMilliseconds } from "date-fns"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type PendingClaim = {
  correlationId: string
  addedAt: number
}

// Suppresses the claim button right after a claim was submitted, while
// the redeem lands and Wormholescan picks it up. Entries expire so a
// failed or abandoned claim attempt never hides the button permanently
// - the redeem status from Wormholescan is the source of truth (see
// useJourneyClaimable).
const PENDING_CLAIM_TTL = minutesToMilliseconds(10)

const isFresh = (claim: PendingClaim) =>
  Date.now() - claim.addedAt < PENDING_CLAIM_TTL

type PendingXcClaimsStore = {
  pendingClaims: PendingClaim[]
  addPendingCorrelationId: (correlationId: string) => void
  removePendingCorrelationId: (correlationId: string) => void
}

export const usePendingClaimsStore = create<PendingXcClaimsStore>()(
  persist(
    (set, get) => ({
      pendingClaims: [],
      addPendingCorrelationId: (correlationId) =>
        set({
          pendingClaims: [
            ...get().pendingClaims.filter(isFresh),
            { correlationId, addedAt: Date.now() },
          ],
        }),
      removePendingCorrelationId: (correlationId) =>
        set({
          pendingClaims: get().pendingClaims.filter(
            (claim) => claim.correlationId !== correlationId,
          ),
        }),
    }),
    {
      name: "pending-claims",
      version: 2,
      migrate: () => ({ pendingClaims: [] }),
    },
  ),
)

export const isClaimPending = (
  pendingClaims: PendingClaim[],
  correlationId: string,
) =>
  pendingClaims.some(
    (claim) => claim.correlationId === correlationId && isFresh(claim),
  )
