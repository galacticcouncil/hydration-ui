import { useTranslation } from "react-i18next"

export type FormattedNumberProps = {
  value: string | number
  symbol?: string
  visibleDecimals?: number
  compact?: boolean
  percent?: boolean
  roundDown?: boolean
  className?: string
}

export function FormattedNumber({
  value,
  symbol,
  visibleDecimals,
  compact,
  percent,
  roundDown,
  className,
}: FormattedNumberProps) {
  const { t } = useTranslation()
  const number = percent ? Number(value) * 100 : Number(value)

  let decimals: number = visibleDecimals ?? 0
  if (number === 0) {
    decimals = 0
  } else if (visibleDecimals === undefined) {
    if (number > 1 || percent || symbol === "USD") {
      decimals = 2
    } else {
      decimals = 7
    }
  }

  const minValue = 10 ** -(decimals as number)
  const isSmallerThanMin = number !== 0 && Math.abs(number) < Math.abs(minValue)
  let formattedNumber = isSmallerThanMin ? minValue : number
  const forceCompact = compact !== false && (compact || number > 99_999)

  // rounding occurs inside of CompactNumber as the prefix, not base number is rounded
  if (roundDown && !forceCompact) {
    formattedNumber =
      Math.trunc(Number(formattedNumber) * 10 ** decimals) / 10 ** decimals
  }

  return (
    <span
      className={className}
      css={{ display: "inline-flex", position: "relative" }}
      sx={{
        align: "center",
      }}
    >
      {isSmallerThanMin && <span sx={{ mr: 2, color: "basic300" }}>{"<"}</span>}
      {symbol?.toLowerCase() === "usd" && !percent && (
        <span sx={{ mr: 2, color: "basic300" }}>$</span>
      )}

      {!forceCompact
        ? t("value", { value: formattedNumber, decimalPlaces: decimals })
        : t("value.compact", { value: formattedNumber })}

      {percent && <span sx={{ ml: 2, color: "basic300" }}>%</span>}
      {symbol?.toLowerCase() !== "usd" && typeof symbol !== "undefined" && (
        <span sx={{ ml: 2, color: "basic300" }}>{symbol}</span>
      )}
    </span>
  )
}
