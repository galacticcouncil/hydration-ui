import { create } from "zustand"
import { persist } from "zustand/middleware"

type PendingXcClaimsStore = {
  pendingCorrelationIds: string[]
  addPendingCorrelationId: (correlationId: string) => void
  removePendingCorrelationId: (correlationId: string) => void
}

export const usePendingClaimsStore = create<PendingXcClaimsStore>()(
  persist(
    (set, get) => ({
      pendingCorrelationIds: [],
      addPendingCorrelationId: (correlationId) =>
        set({
          pendingCorrelationIds: [
            ...get().pendingCorrelationIds,
            correlationId,
          ],
        }),
      removePendingCorrelationId: (correlationId) =>
        set({
          pendingCorrelationIds: get().pendingCorrelationIds.filter(
            (id) => id !== correlationId,
          ),
        }),
    }),
    { name: "pending-claims", version: 1 },
  ),
)
