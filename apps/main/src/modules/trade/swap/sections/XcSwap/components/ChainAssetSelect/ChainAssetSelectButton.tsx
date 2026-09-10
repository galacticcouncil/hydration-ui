import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import {
  XcAssetLogo,
  XcLogo,
} from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/XcLogo"
import { XcChainAssetPair } from "@/modules/trade/swap/sections/XcSwap/types"

import { SButton } from "./ChainAssetSelectButton.styled"

type ChainAssetSelectButtonProps = {
  currentSelection: XcChainAssetPair | null
  disabled?: boolean
}

export const ChainAssetSelectButton: React.FC<ChainAssetSelectButtonProps> = ({
  currentSelection,
  disabled,
  ...props
}) => {
  const { t } = useTranslation("trade")
  return (
    <SButton
      variant={currentSelection ? "tertiary" : "secondary"}
      disabled={disabled || false}
      hasSelection={!!currentSelection}
      {...props}
    >
      {currentSelection ? (
        <Flex align="center" gap="base">
          <XcLogo src={currentSelection.chain.logo} />
          <XcAssetLogo asset={currentSelection.asset} />
          <Text fs="p3" fw={600} color={getToken("text.high")}>
            {currentSelection.asset.symbol}
          </Text>
        </Flex>
      ) : (
        <Text fs="p3" fw={600}>
          {t("xc.swap.select.placeholder")}
        </Text>
      )}
      <Icon size="m" component={ChevronDown} sx={{ flexShrink: 0 }} />
    </SButton>
  )
}
