import { Text } from "components/Typography/Text/Text"
import React from "react"
import { useTranslation } from "react-i18next"
import NumberFormat from "react-number-format"
import { SCustomInput } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositCustomInput.styled"

export type RemoveDepositCustomInputProps = {
  readonly percentage: number
} & React.ComponentPropsWithoutRef<typeof NumberFormat>

export const RemoveDepositCustomInput: React.FC<
  RemoveDepositCustomInputProps
> = ({ percentage, ...props }) => {
  const { t } = useTranslation()
  return (
    <div sx={{ flex: "column", justify: "flex-end" }}>
      <NumberFormat customInput={SCustomInput} decimalScale={4} {...props} />
      <Text fw={126} fs={16} lh={"1.3"} color="pink500" tAlign="right">
        {t("value.percentage", {
          value: percentage,
        })}
      </Text>
    </div>
  )
}
