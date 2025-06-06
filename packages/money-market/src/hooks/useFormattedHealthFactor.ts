import { useTheme } from "@galacticcouncil/ui/theme"
import Big from "big.js"

type HealthFactorLevel = "none" | "good" | "warning" | "danger"

export const useFormattedHealthFactor = (value: string) => {
  const { getToken } = useTheme()

  const healthFactor = Big(value)

  const isHealthFactorValid = !healthFactor.eq("-1")

  const formattedHealthFactor = isHealthFactorValid
    ? healthFactor.toFixed(2, Big.roundDown)
    : "-1"

  const level: HealthFactorLevel = !isHealthFactorValid
    ? "none"
    : healthFactor.gte(3)
      ? "good"
      : healthFactor.lt(1.1)
        ? "danger"
        : "warning"

  const tokenMap = {
    none: "text.high",
    good: "accents.success.emphasis",
    warning: "accents.alert.primary",
    danger: "accents.danger.emphasis",
  } as const

  return {
    isHealthFactorValid,
    healthFactorLevel: level,
    healthFactor: formattedHealthFactor,
    healthFactorColor: `${getToken(tokenMap[level])}`,
  }
}
