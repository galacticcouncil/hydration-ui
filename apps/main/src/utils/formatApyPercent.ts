import type { TFunction } from "i18next"

export const APY_NOT_AVAILABLE = "N/A"

export const formatApyPercent = (
  t: TFunction,
  value: number | string | null | undefined,
): string => {
  if (value === null || value === undefined) return APY_NOT_AVAILABLE
  return t("percent", { value })
}
