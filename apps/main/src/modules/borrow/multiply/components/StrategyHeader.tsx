import {
  Flex,
  Icon,
  LOGO_SIZES,
  Text,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"
import { ComponentType } from "react"

import { MultiplyPageBackLink } from "@/modules/borrow/multiply/components/MultiplyPageBackLink"
import { MultiplyAssetPairConfig } from "@/modules/borrow/multiply/types"
import { useAssets } from "@/providers/assetsProvider"

type StrategyHeaderProps = {
  name: string
  icon: ComponentType
  selectedPairId: string
  onPairIdChange: (pairId: string) => void
  pairs: MultiplyAssetPairConfig[]
}

export const StrategyHeader: React.FC<StrategyHeaderProps> = ({
  name,
  icon,
  selectedPairId,
  onPairIdChange,
  pairs,
}) => {
  const { getAsset } = useAssets()

  return (
    <Flex align="center" gap="base">
      <MultiplyPageBackLink />
      <Flex gap="m" flex={1}>
        <Icon component={icon} size={pxToRem(LOGO_SIZES.large)} />
        <Text fs="h5" lh={1.2} fw={500} font="primary">
          {name}
        </Text>
      </Flex>
      <ToggleGroup
        type="single"
        value={selectedPairId}
        onValueChange={(value) => {
          if (value) onPairIdChange(value)
        }}
      >
        {pairs.map((pair) => {
          const collateral = getAsset(pair.collateralAssetId)
          const debt = getAsset(pair.debtAssetId)
          const label =
            collateral && debt ? `${collateral.symbol}/${debt.symbol}` : pair.id

          return (
            <ToggleGroupItem key={pair.id} value={pair.id}>
              {label}
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
    </Flex>
  )
}
