import { useMemo } from "react"
import { isNonNullish } from "remeda"

import { STABLE_BONDS } from "@/modules/strategies/stable-bonds/config/bonds"
import { useOtcOffers } from "@/modules/trade/otc/table/OtcTable.query"
import { useAssets } from "@/providers/assetsProvider"

export const useStableBonds = () => {
  const { getBond } = useAssets()
  const { isSuccess } = useOtcOffers()

  return useMemo(() => {
    if (!isSuccess) {
      return { active: undefined, past: [], isReady: false }
    }

    const bonds = Object.values(STABLE_BONDS)
      .map((config) => getBond(config.bondId))
      .filter(isNonNullish)

    const current = bonds.reduce<(typeof bonds)[number] | undefined>(
      (best, bond) => {
        if (!best) return bond
        return bond.maturity > best.maturity ? bond : best
      },
      undefined,
    )

    return {
      active: current,
      past: bonds
        .filter((bond) => bond.id !== current?.id)
        .sort((a, b) => b.maturity - a.maturity),
      isReady: isSuccess,
    }
  }, [getBond, isSuccess])
}
