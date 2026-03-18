import { Stack } from "@galacticcouncil/ui/components"
import { useEffect, useMemo } from "react"

import { StrategyHeader } from "@/modules/borrow/multiply/components/StrategyHeader"
import { MULTIPLY_ASSETS_CONFIG } from "@/modules/borrow/multiply/config/pairs"
import { useMultiplyPairDetailData } from "@/modules/borrow/multiply/hooks/useMultiplyPairDetailData"
import { MultiplyDetailPage } from "@/modules/borrow/multiply/MultiplyDetailPage"
import { MultiplyStrategyConfig } from "@/modules/borrow/multiply/types"

type MultiplyStrategyDetailPageProps = {
  strategy: MultiplyStrategyConfig
  pairIdFromSearch: string | undefined
  onPairIdChange: (pairId: string) => void
}

export const MultiplyStrategyDetailPage: React.FC<
  MultiplyStrategyDetailPageProps
> = ({ strategy, pairIdFromSearch, onPairIdChange }) => {
  const pairConfigs = useMemo(
    () =>
      strategy.pairIds
        .map((id) => MULTIPLY_ASSETS_CONFIG.find((c) => c.id === id))
        .filter((c): c is NonNullable<typeof c> => !!c),
    [strategy.pairIds],
  )

  const selectedPairId = useMemo(() => {
    if (pairIdFromSearch && strategy.pairIds.includes(pairIdFromSearch)) {
      return pairIdFromSearch
    }
    return strategy.pairIds[0]!
  }, [pairIdFromSearch, strategy.pairIds])

  useEffect(() => {
    if (
      pairIdFromSearch &&
      !strategy.pairIds.includes(pairIdFromSearch) &&
      strategy.pairIds[0]
    ) {
      onPairIdChange(strategy.pairIds[0])
    }
  }, [pairIdFromSearch, strategy.pairIds, onPairIdChange])

  const selectedConfig = useMemo(
    () => pairConfigs.find((c) => c.id === selectedPairId) ?? pairConfigs[0],
    [pairConfigs, selectedPairId],
  )

  const detail = useMultiplyPairDetailData(selectedConfig)

  if (!selectedConfig || !detail) return null

  return (
    <Stack gap="xxl">
      <StrategyHeader
        name={strategy.name}
        icon={strategy.icon}
        selectedPairId={selectedPairId}
        onPairIdChange={onPairIdChange}
        pairs={pairConfigs}
      />

      <MultiplyDetailPage
        key={selectedConfig.id}
        config={selectedConfig}
        {...detail}
      />
    </Stack>
  )
}
