import { Icon, Separator, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ArrowDown } from "lucide-react"

import {
  SAssetSwitcher,
  SPriceContainer,
  SSwitchContainer,
} from "./AssetSwitcher.styled"

export const AssetSwitcher = ({
  onSwitchAssets,
}: {
  onSwitchAssets: () => void
}) => {
  return (
    <SAssetSwitcher sx={{ alignItems: "center", mx: -20 }}>
      <Separator />
      <SSwitchContainer onClick={onSwitchAssets}>
        <Icon size={16} component={ArrowDown} />
      </SSwitchContainer>
      <Separator />
      <SPriceContainer>
        <Text fs="p6" color={getToken("text.high")}>
          Price: 1 HDX = 3 661.923 kUSD
        </Text>
      </SPriceContainer>
      <Separator />
    </SAssetSwitcher>
  )
}
