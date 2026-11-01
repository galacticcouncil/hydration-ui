import {
  AssetButton,
  AssetInput,
  Box,
  Flex,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getChainId, isValidBigSource } from "@galacticcouncil/utils"
import Big from "big.js"
import { FC } from "react"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { ChainLogo } from "@/components/ChainLogo"
import { OnrampAssetAmountProps } from "@/modules/onramp/components/OnrampAssetAmount"
import { XAssetLogo } from "@/modules/xcm/transfer/components/XAssetLogo"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { percentageOf, toDecimal } from "@/utils/formatting"

export const OnrampAssetInput: FC<OnrampAssetAmountProps> = ({
  label,
  selection,
  onAssetClick,
  assetSelectorDisabled,
  selectAssetLabel,
  assetSelector,
  assetSelectorLayout,
  amountProps,
}) => {
  const { t } = useTranslation("common")
  const { control } = useFormContext<XcmFormValues>()
  const { field, fieldState } = useController({
    control,
    name: amountProps.fieldName,
  })
  const {
    balance,
    balanceMax,
    disabled,
    isLoading,
    isBalanceLoading,
    withMaxButton,
    withPercentageButton,
    assetPrice,
  } = amountProps
  const max = balanceMax
    ? toDecimal(balanceMax.amount, balanceMax.decimals)
    : ""
  const displayPrice =
    isValidBigSource(assetPrice) && isValidBigSource(field.value)
      ? Big(field.value).times(assetPrice)
      : undefined
  const asset = selection
    ? {
        symbol: selection.asset.originSymbol,
        icon: (
          <XAssetLogo
            asset={selection.asset}
            chain={selection.chain}
            showChainLogo={false}
          />
        ),
      }
    : null

  return (
    <Box px={["l", "xl"]} py={["m", "l"]}>
      <AssetInput
        assetSelectorLayout={assetSelectorLayout}
        isAmountHidden={assetSelectorLayout === "stacked" && !selection}
        label={label}
        labelAdornment={
          selection && (
            <Flex as="span" align="center" gap="s" minWidth={0}>
              <ChainLogo
                ecosystem={selection.chain.ecosystem}
                chainId={getChainId(selection.chain)}
                size="extra-small"
                alt={selection.chain.name}
              />
              <Text fs="p5" fw={500} color={getToken("text.high")} truncate>
                {selection.chain.name}
              </Text>
            </Flex>
          )
        }
        assetSelector={
          assetSelector ?? (
            <AssetButton
              asset={asset}
              onClick={onAssetClick}
              selectAssetLabel={selectAssetLabel}
              isDisabled={assetSelectorDisabled}
            />
          )
        }
        value={field.value}
        onChange={field.onChange}
        amountError={isLoading ? undefined : fieldState.error?.message}
        displayValue={
          displayPrice !== undefined
            ? t("currency", { value: displayPrice })
            : undefined
        }
        isValueLoading={isLoading}
        isDisabled={disabled}
        balance={{
          label: t("balance"),
          value: balance
            ? t("number", {
                value: toDecimal(balance.amount, balance.decimals),
              })
            : "—",
          isLoading: isBalanceLoading || isLoading,
          onMax: withMaxButton ? () => field.onChange(max) : null,
          isMaxDisabled: !balanceMax || balanceMax.toBig().lte(0),
          withPercentageButton,
          onPercentage:
            withPercentageButton && balanceMax
              ? (percent) =>
                  field.onChange(
                    percentageOf(max, percent, balanceMax.decimals),
                  )
              : null,
        }}
      />
    </Box>
  )
}
