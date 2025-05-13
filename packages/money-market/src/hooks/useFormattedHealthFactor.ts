import { useTheme } from "@galacticcouncil/ui/theme"
import Big from "big.js"

import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"

export const useFormattedHealthFactor = (value: string) => {
  const { formatNumber } = useAppFormatters()
  const formattedHealthFactor = formatNumber(value)

  const hfBig = Big(value)

  const { themeProps } = useTheme()
  let healthFactorColor = ""
  if (hfBig.gte(3)) {
    healthFactorColor = themeProps.accents.success.emphasis
  } else if (hfBig.lt(1.1)) {
    healthFactorColor = themeProps.accents.danger.emphasis
  } else {
    healthFactorColor = themeProps.accents.alert.primary
  }

  return {
    healthFactor: formattedHealthFactor,
    healthFactorColor,
  }
}
