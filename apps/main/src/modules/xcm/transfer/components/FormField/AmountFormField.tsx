import {
  Flex,
  MicroButton,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AssetAmount } from "@galacticcouncil/xcm-core"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { NumberFormField } from "@/modules/xcm/transfer/components/FormField/NumberFormField"
import {
  XcmFormFieldName,
  XcmFormValues,
} from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { scaleHuman } from "@/utils/formatting"

type AmountFormFieldProps = {
  fieldName: XcmFormFieldName
  balance?: AssetAmount
  disabled?: boolean
  className?: string
  showMaxButton?: boolean
  isLoading?: boolean
}

export const AmountFormField: React.FC<AmountFormFieldProps> = ({
  fieldName,
  balance,
  disabled = false,
  className,
  showMaxButton = true,
  isLoading = false,
}) => {
  const { t } = useTranslation(["common", "xcm"])
  const { control } = useFormContext<XcmFormValues>()
  const { field } = useController({
    control,
    name: fieldName,
  })

  const handleMaxClick = () => {
    field.onChange(balance ? balance.toDecimal().toString() : "0")
  }

  return (
    <Flex className={className} flex={1} gap={10} direction="column">
      <Flex justify="flex-end">
        <Flex align="center" gap={4}>
          <Text fs="p6" color={getToken("text.low")}>
            {t("balance")}:{" "}
            {t("number", {
              value: balance
                ? scaleHuman(balance.amount, balance.decimals)
                : "0",
            })}
          </Text>
          {showMaxButton && (
            <MicroButton
              onClick={handleMaxClick}
              disabled={disabled || !balance || balance.toBig().lte(0)}
            >
              {t("max")}
            </MicroButton>
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
