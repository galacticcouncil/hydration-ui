import { Stack } from "@galacticcouncil/ui/components"
import { useMemo } from "react"
import { isNonNullish } from "remeda"

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
        .filter(isNonNullish),
    [strategy.pairIds],
  )

  const selectedConfig = pairIdFromSearch
    ? pairConfigs.find((c) => c.id === pairIdFromSearch)
    : pairConfigs[0]

  const detail = useMultiplyPairDetailData(selectedConfig)

  if (!selectedConfig || !detail) return null

  return (
    <Stack gap="xxl">
      <StrategyHeader
        name={strategy.name}
        icon={strategy.icon}
        selectedPairId={selectedConfig.id}
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
