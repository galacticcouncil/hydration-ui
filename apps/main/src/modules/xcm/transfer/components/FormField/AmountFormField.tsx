import {
  Flex,
  MicroButton,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AssetAmount } from "@galacticcouncil/xc-core"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { NumberFormField } from "@/modules/xcm/transfer/components/FormField/NumberFormField"
import {
  XcmFormFieldName,
  XcmFormValues,
} from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { toDecimal } from "@/utils/formatting"

type AmountFormFieldProps = {
  fieldName: XcmFormFieldName
  balance?: AssetAmount
  balanceMax?: AssetAmount
  disabled?: boolean
  className?: string
  isLoading?: boolean
  withMaxButton?: boolean
}

export const AmountFormField: React.FC<AmountFormFieldProps> = ({
  fieldName,
  balance,
  balanceMax,
  disabled = false,
  className,
  isLoading = false,
  withMaxButton = false,
}) => {
  const { t } = useTranslation(["common", "xcm"])
  const { control } = useFormContext<XcmFormValues>()
  const { field } = useController({
    control,
    name: fieldName,
  })

  return (
    <Flex className={className} flex={1} gap={10} direction="column">
      <Flex justify="flex-end">
        <Flex align="center" gap={4}>
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
                  disabled={
                    disabled || !balanceMax || balanceMax.toBig().lte(0)
                  }
                >
                  {t("max")}
                </MicroButton>
              )}
            </>
          )}
        </Flex>
      </Flex>
      {isLoading ? (
        <Skeleton width={100} height="100%" sx={{ ml: "auto" }} />
      ) : (
        <NumberFormField
          fieldName={fieldName}
          placeholder="0"
          disabled={disabled}
          variant="embedded"
        />
      )}
    </Flex>
  )
}
