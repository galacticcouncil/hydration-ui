import { create } from "zustand"
import { persist } from "zustand/middleware"

import {
  findPairByAssets,
  MULTIPLY_PAIRS,
} from "@/modules/strategies/multiply/config/pairs"
import { useLoopBuilder } from "@/modules/strategies/multiply/hooks/useMultiplyPairMetrics"

export type SavedCustomLoop = { collateralAssetId: string; debtAssetId: string }

type CustomLoopsStore = {
  loops: SavedCustomLoop[]
  add: (loop: SavedCustomLoop) => void
  remove: (loop: SavedCustomLoop) => void
}

const isSame = (a: SavedCustomLoop, b: SavedCustomLoop) =>
  a.collateralAssetId === b.collateralAssetId && a.debtAssetId === b.debtAssetId

// One list per browser, shared by every wallet: a loop is a market
// preference, not account data. Kept in creation order.
export const useCustomLoopsStore = create<CustomLoopsStore>()(
  persist(
    (set) => ({
      loops: [],
      add: (loop) =>
        set((s) =>
          s.loops.some((l) => isSame(l, loop))
            ? s
            : { loops: [...s.loops, loop] },
        ),
      remove: (loop) =>
        set((s) => ({ loops: s.loops.filter((l) => !isSame(l, loop)) })),
    }),
    { name: "multiply-custom-loops" },
  ),
)

/** Presets first, then the saved custom loops in creation order. */
export const useMultiplyPairs = () => {
  const loops = useCustomLoopsStore((s) => s.loops)
  const { build } = useLoopBuilder()

  const custom = loops.flatMap((l) => {
    if (findPairByAssets(MULTIPLY_PAIRS, l.collateralAssetId, l.debtAssetId))
      return []
    const pair = build(l.collateralAssetId, l.debtAssetId)
    return pair ? [pair] : []
  })

  return [...MULTIPLY_PAIRS, ...custom]
}
