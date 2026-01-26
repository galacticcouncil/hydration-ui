import {
  Box,
  Flex,
  FormError,
  FormLabel,
  MicroButton,
  Skeleton,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { isValidBigSource } from "@galacticcouncil/utils"
import { AssetAmount } from "@galacticcouncil/xc-core"
import Big from "big.js"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  XcmFormFieldName,
  XcmFormValues,
} from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { toDecimal } from "@/utils/formatting"

import { SNumberInput, SNumberInputAddon } from "./AmountFormField.styled"

type AmountFormFieldProps = {
  fieldName: XcmFormFieldName
  balance?: AssetAmount
  balanceMax?: AssetAmount
  disabled?: boolean
  className?: string
  isLoading?: boolean
  withMaxButton?: boolean
  assetPrice?: string
}

export const AmountFormField: React.FC<AmountFormFieldProps> = ({
  fieldName,
  balance,
  balanceMax,
  disabled = false,
  className,
  isLoading = false,
  withMaxButton = false,
  assetPrice,
}) => {
  const { t } = useTranslation(["common", "xcm"])
  const { control } = useFormContext<XcmFormValues>()
  const { field, fieldState } = useController({
    control,
    name: fieldName,
  })

  const errorMessage = fieldState.error?.message

  const displayPrice =
    isValidBigSource(assetPrice) && isValidBigSource(field.value)
      ? Big(field.value).times(assetPrice)
      : undefined

  return (
    <Flex className={className} flex={1} gap="base" direction="column">
      <Flex ml="auto" align="center" gap="s">
        {isLoading ? (
          <Text fs="p6">
            <Skeleton width={80} />
          </Text>
        ) : (
          <>
            <Text fs="p6" color={getToken("text.low")}>
              {t("balance")}:{" "}
              {balance
                ? t("number", {
                    value: toDecimal(balance.amount, balance.decimals),
                  })
                : "-"}
            </Text>{" "}
            {withMaxButton && (
              <MicroButton
                onClick={() => {
                  const amount = balanceMax
                    ? toDecimal(balanceMax.amount, balanceMax.decimals)
                    : ""
                  field.onChange(amount)
                }}
                disabled={disabled || !balanceMax || balanceMax.toBig().lte(0)}
              >
                {t("max")}
              </MicroButton>
            )}
          </>
        )}
      </Flex>
      {isLoading ? (
        <Skeleton width={100} height="100%" sx={{ ml: "auto" }} />
      ) : (
        <Stack>
          <Box position="relative">
            <SNumberInput
              value={field.value}
              onValueChange={({ value }) => field.onChange(value)}
              isError={!!errorMessage}
              allowNegative={false}
              placeholder="0"
              disabled={disabled}
              variant="embedded"
            />
            {(!!errorMessage || isValidBigSource(displayPrice)) && (
              <SNumberInputAddon>
                {errorMessage ? (
                  <FormError>{errorMessage}</FormError>
                ) : (
                  <FormLabel color={getToken("text.low")}>
                    {t("currency", { value: displayPrice })}
                  </FormLabel>
                )}
              </SNumberInputAddon>
            )}
          </Box>
        </Stack>
      )}
    </Flex>
  )
}
