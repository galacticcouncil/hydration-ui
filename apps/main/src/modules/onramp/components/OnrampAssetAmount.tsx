import { Flex, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ComponentProps, FC, ReactNode } from "react"

import { ChainAssetSelectButton } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelectButton"
import { AmountFormField } from "@/modules/xcm/transfer/components/FormField"
import { XAssetLogo } from "@/modules/xcm/transfer/components/XAssetLogo"

export type OnrampAssetAmountProps = {
  label: ReactNode
  selection: ComponentProps<typeof ChainAssetSelectButton>["currentSelection"]
  onAssetClick?: () => void
  amountProps: ComponentProps<typeof AmountFormField>
}

export const OnrampAssetAmount: FC<OnrampAssetAmountProps> = ({
  label,
  selection,
  onAssetClick,
  amountProps,
}) => (
  <Flex px={["l", "xl"]} py={["m", "l"]} gap="m" align="flex-start">
    <Stack gap="m" flex={1} minWidth={0}>
      <Text fs="p5" color={getToken("text.medium")}>
        {label}
      </Text>
      {!onAssetClick && selection ? (
        <Flex gap="base" align="center">
          <XAssetLogo asset={selection.asset} chain={selection.chain} />
          <Text fs="p3" fw={600}>
            {selection.asset.originSymbol}
          </Text>
        </Flex>
      ) : (
        <ChainAssetSelectButton
          currentSelection={selection}
          onClick={onAssetClick}
        />
      )}
    </Stack>
    <AmountFormField {...amountProps} />
  </Flex>
)
