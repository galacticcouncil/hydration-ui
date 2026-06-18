import { Icon, Separator, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ArrowDown } from "lucide-react"

import {
  SAssetSwitcher,
  SPriceContainer,
  SSwitchContainer,
} from "@/components/AssetSwitcher/AssetSwitcher.styled"

export const XcSwapSwitcher = () => {
  return (
    <SAssetSwitcher sx={{ alignItems: "center", mx: "-xl" }}>
      <Separator />
      <SSwitchContainer disabled>
        <Icon
          size="m"
          component={ArrowDown}
          color={getToken("icons.primary")}
        />
      </SSwitchContainer>
      <Separator />
      <SPriceContainer>
        <Text fw={500} fs="p6" lh={1.4} color={getToken("text.high")}>
          Exchange rate not available
        </Text>
      </SPriceContainer>
      <Separator />
    </SAssetSwitcher>
  )
}
