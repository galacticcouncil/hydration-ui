import { NumberInput, NumberInputProps } from "@galacticcouncil/ui/components"
import React, { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"

export const TipInput: React.FC<NumberInputProps> = (props) => {
  const { t } = useTranslation("common")
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  return (
    <NumberInput
      getInputRef={inputRef}
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
