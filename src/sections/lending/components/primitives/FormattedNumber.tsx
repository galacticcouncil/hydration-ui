import { normalizeBN, valueToBigNumber } from "@aave/math-utils"

interface CompactNumberProps {
  value: string | number
  visibleDecimals?: number
  roundDown?: boolean
  compactThreshold?: number
}

const POSTFIXES = ["", "K", "M", "B", "T", "P", "E", "Z", "Y"]

export const compactNumber = ({
  value,
  visibleDecimals = 2,
  roundDown,
  compactThreshold,
}: CompactNumberProps) => {
  const bnValue = valueToBigNumber(value)

  let integerPlaces = bnValue.toFixed(0).length
  if (compactThreshold && Number(value) <= compactThreshold) {
    integerPlaces = 0
  }
  const significantDigitsGroup = Math.min(
    Math.floor(integerPlaces ? (integerPlaces - 1) / 3 : 0),
    POSTFIXES.length - 1,
  )
  const postfix = POSTFIXES[significantDigitsGroup]
  let formattedValue = normalizeBN(
    bnValue,
    3 * significantDigitsGroup,
  ).toNumber()
  if (roundDown) {
    // Truncates decimals after the visible decimal point, i.e. 10.237 with 2 decimals becomes 10.23
    formattedValue =
      Math.trunc(Number(formattedValue) * 10 ** visibleDecimals) /
      10 ** visibleDecimals
  }
  const prefix = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: visibleDecimals,
    minimumFractionDigits: visibleDecimals,
  }).format(formattedValue)

  return { prefix, postfix }
}

function CompactNumber({
  value,
  visibleDecimals,
  roundDown,
}: CompactNumberProps) {
  const { prefix, postfix } = compactNumber({
    value,
    visibleDecimals,
    roundDown,
  })

  return (
    <>
      {prefix}
      {postfix}
    </>
  )
}

export type FormattedNumberProps = {
  value: string | number
  symbol?: string
  visibleDecimals?: number
  compact?: boolean
  percent?: boolean
  roundDown?: boolean
  compactThreshold?: number
  className?: string
}

export function FormattedNumber({
  value,
  symbol,
  visibleDecimals,
  compact,
  percent,
  roundDown,
  compactThreshold,
  className,
}: FormattedNumberProps) {
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

      {!forceCompact ? (
        new Intl.NumberFormat("en-US", {
          maximumFractionDigits: decimals,
          minimumFractionDigits: decimals,
        }).format(formattedNumber)
      ) : (
        <CompactNumber
          value={formattedNumber}
          visibleDecimals={decimals}
          roundDown={roundDown}
          compactThreshold={compactThreshold}
        />
      )}

      {percent && <span sx={{ ml: 2, color: "basic300" }}>%</span>}
      {symbol?.toLowerCase() !== "usd" && typeof symbol !== "undefined" && (
        <span sx={{ ml: 2, color: "basic300" }}>{symbol}</span>
      )}
    </span>
  )
}
