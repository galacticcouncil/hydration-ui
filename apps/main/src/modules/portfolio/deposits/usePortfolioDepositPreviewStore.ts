import { useMemo } from "react"
import { create } from "zustand"

import { portfolioDepositSamples } from "./PortfolioDepositPreview.mock"
import { getPortfolioDepositSamples } from "./PortfolioDepositPreview.utils"

type PortfolioDepositPreviewState = {
  claimedIds: string[]
  claimSample: (id: string) => void
}

// Session-only presentation state. Claiming a sample never submits a transaction.
export const usePortfolioDepositPreviewStore =
  create<PortfolioDepositPreviewState>((set) => ({
    claimedIds: [],
    claimSample: (id) =>
      set((state) => {
        const sample = portfolioDepositSamples.find(
          (sample) => sample.id === id,
        )
        if (sample?.status !== "claimable" || state.claimedIds.includes(id))
          return state
        return { claimedIds: [...state.claimedIds, id] }
      }),
  }))

export const usePortfolioDepositSamples = () => {
  const claimedIds = usePortfolioDepositPreviewStore(
    (state) => state.claimedIds,
  )
  return useMemo(
    () => getPortfolioDepositSamples(portfolioDepositSamples, claimedIds),
    [claimedIds],
  )
}

export const useClaimableDepositSamples = () => {
  const samples = usePortfolioDepositSamples()
  return useMemo(
    () => samples.filter((sample) => sample.status === "claimable"),
    [samples],
  )
}
