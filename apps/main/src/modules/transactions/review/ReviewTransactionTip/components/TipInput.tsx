import { NumberInput, NumberInputProps } from "@galacticcouncil/ui/components"
import React, { useCallback } from "react"
import { useTranslation } from "react-i18next"

export const TipInput: React.FC<NumberInputProps> = (props) => {
  const { t } = useTranslation("common")

  const focusInput = useCallback((input: HTMLInputElement) => {
    if (input) {
      input.focus()
      input.select()
    }
  }, [])

  return (
    <NumberInput
      getInputRef={focusInput}
      customSize="small"
      placeholder={t("amount")}
      onClick={(e) => e.currentTarget.select()}
      allowLeadingZeros={false}
      allowNegative={false}
      sx={{ borderRadius: "md", maxWidth: 120 }}
      {...props}
    />
  )
}
