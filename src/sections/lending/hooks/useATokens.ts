import { useShallow } from "hooks/useShallow"
import { useMemo } from "react"
import { useAssetRegistry } from "state/store"

export const useATokens = () => {
  const aTokenPairs = useAssetRegistry(useShallow((state) => state.aTokenPairs))

  return useMemo(() => {
    const aTokenMap = new Map(aTokenPairs)
    const aTokenReverseMap = new Map(
      aTokenPairs.map(([aToken, underlying]) => [underlying, aToken]),
    )
    return {
      aTokenMap,
      aTokenPairs,
      aTokenReverseMap,
    }
  }, [aTokenPairs])
}
