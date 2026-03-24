import { formatNumber } from "@galacticcouncil/utils"

export const EPSILON = 1e-9
export const MAX_STEPS = 50

export function printFormattedSteps<
  T extends Record<string, string | number> & { step: number },
>(steps: T[]) {
  console.table(
    steps.map((entry) => {
      const formatted: Record<string, string | number> = {}
      for (const [key, value] of Object.entries(entry)) {
        formatted[key] =
          key === "step" || typeof value === "number"
            ? value
            : formatNumber(value)
      }
      return formatted
    }),
  )
}
