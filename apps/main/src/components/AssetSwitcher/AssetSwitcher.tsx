import { Icon, Separator, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ArrowDown } from "lucide-react"

import {
  SAssetSwitcher,
  SPriceContainer,
  SSwitchContainer,
} from "./AssetSwitcher.styled"

type AssetSwitcherProps = {
  onSwitchAssets: () => void
  onPriceClick: () => void
  price: string
  disabled?: boolean
}

export const AssetSwitcher = ({
  onSwitchAssets,
  onPriceClick,
  price,
  disabled = false,
}: AssetSwitcherProps) => {
  return (
    <SAssetSwitcher sx={{ alignItems: "center", mx: -20 }}>
      <Separator />
      <SSwitchContainer onClick={onSwitchAssets} disabled={disabled}>
        <Icon size={16} component={ArrowDown} />
      </SSwitchContainer>
      <Separator />
      <SPriceContainer onClick={onPriceClick} disabled={disabled}>
        <Text fs="p6" color={getToken("text.high")}>
          {price}
        </Text>
      </SPriceContainer>
      <Separator />
    </SAssetSwitcher>
  )
}
