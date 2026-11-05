import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import { ButtonProps, Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getChainId } from "@galacticcouncil/utils"
import { AnyChain, Asset } from "@galacticcouncil/xc-core"
import { useTranslation } from "react-i18next"

import { ChainLogo } from "@/components/ChainLogo"
import { XAssetLogo } from "@/modules/xcm/transfer/components/XAssetLogo"

import { SButton } from "./ChainAssetSelectButton.styled"

type ChainAssetSelectButtonProps = Pick<ButtonProps, "aria-label"> & {
  currentSelection: { asset: Asset; chain: AnyChain } | null
  disabled?: boolean
  fullWidth?: boolean
  placeholder?: string
  showChainName?: boolean
  onClick?: () => void
}

export const ChainAssetSelectButton: React.FC<ChainAssetSelectButtonProps> = ({
  currentSelection,
  disabled,
  fullWidth = false,
  placeholder,
  showChainName = false,
  ...props
}) => {
  const { t } = useTranslation("xcm")

  return (
    <SButton
      variant={currentSelection ? "tertiary" : "secondary"}
      disabled={disabled || false}
      hasSelection={!!currentSelection}
      fullWidth={fullWidth}
      {...props}
    >
      {currentSelection ? (
        <Flex align="center" gap="base" minWidth={0}>
          <ChainLogo
            size="small"
            ecosystem={currentSelection.chain.ecosystem}
            chainId={getChainId(currentSelection.chain)}
          />
          <XAssetLogo
            asset={currentSelection.asset}
            chain={currentSelection.chain}
            sx={{ ml: "-m" }}
          />
          <Text fs="p3" fw={600} color={getToken("text.high")} truncate>
            {showChainName && `${currentSelection.chain.name} · `}
            {currentSelection.asset.originSymbol}
          </Text>
        </Flex>
      ) : (
        <Text fs="p3" fw={600}>
          {placeholder ?? t("chainAssetSelect.button.selectAssetChain")}
        </Text>
      )}
      <Icon size="m" component={ChevronDown} sx={{ flexShrink: 0 }} />
    </SButton>
  )
}
