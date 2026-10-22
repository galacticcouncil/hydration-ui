import { Box } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { MAX_DISPLAY_HF } from "@/modules/money-market/constants"
import { useFormattedHealthFactor } from "@/modules/money-market/useFormattedHealthFactor"

/** The package reports "-1" when there is no debt, i.e. the health factor is unbounded. */
export const HF_UNBOUNDED = "-1"

const isUnbounded = (value: string) =>
  value === HF_UNBOUNDED || Big(value).gt(MAX_DISPLAY_HF)

/** Rounded half up to 2 decimals, the same as v1's `useFormattedHealthFactor`. */
export const toDisplayedHealthFactor = (value: string) =>
  isUnbounded(value) ? "∞" : Big(value).toFixed(2, Big.roundHalfUp)

/** A health factor in its risk colour; inherits the font of what holds it. */
export const HealthFactorNumber: FC<{ readonly value: string }> = ({
  value,
}) => {
  const { t } = useTranslation()
  const { healthFactorColor } = useFormattedHealthFactor(value)
  const unbounded = isUnbounded(value)

  return (
    <Box
      as="span"
      sx={{
        color: unbounded
          ? getToken("accents.success.emphasis")
          : healthFactorColor,
      }}
    >
      {unbounded
        ? toDisplayedHealthFactor(value)
        : t("number", {
            value: toDisplayedHealthFactor(value),
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
    </Box>
  )
}
