import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AnyChain, Asset } from "@galacticcouncil/xcm-core"
import { ButtonHTMLAttributes } from "react"
import { useTranslation } from "react-i18next"

import { ChainLogo } from "@/components/ChainLogo"
import { XAssetLogo } from "@/modules/xcm/transfer/components/XAssetLogo"

import { SButton } from "./ChainAssetSelectButton.styled"

type ChainAssetSelectButtonProps = {
  currentSelection: { asset: Asset; chain: AnyChain } | null
  type: "source" | "destination"
  disabled?: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">

export const ChainAssetSelectButton: React.FC<ChainAssetSelectButtonProps> = ({
  currentSelection,
  type,
  disabled,
  ...props
}) => {
  const { t } = useTranslation("xcm")

  const getButtonText = () => {
    if (currentSelection) {
      return currentSelection.asset.originSymbol
    }

    if (disabled) {
      return type === "source"
        ? t("chainAssetSelect.button.selectSourceFirst")
        : t("chainAssetSelect.button.selectDestinationFirst")
    }

    return t("chainAssetSelect.button.selectAssetChain")
  }

  return (
    <SButton
      variant={currentSelection ? "tertiary" : "secondary"}
      disabled={disabled || false}
      hasSelection={!!currentSelection}
      {...props}
    >
      {currentSelection ? (
        <Flex align="center" gap={6}>
          <ChainLogo chain={currentSelection.chain} />
          <XAssetLogo
            asset={currentSelection.asset}
            chain={currentSelection.chain}
            sx={{ ml: -10 }}
          />
          <Text fs="p3" fw={600} color={getToken("text.high")}>
            {getButtonText()}
          </Text>
        </Flex>
      ) : (
        <Text fs="p3" fw={600}>
          {getButtonText()}
        </Text>
      )}
      <Icon size={16} component={ChevronDown} sx={{ flexShrink: 0 }} />
    </SButton>
  )
}
