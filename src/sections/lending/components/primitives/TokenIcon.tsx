import { Icon } from "components/Icon/Icon"

const CDN_BASE_URL =
  "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest"

interface TokenIconProps {
  symbol: string
  aToken?: boolean
  size?: number
  className?: string
}

/**
 * Renders a tokenIcon specified by symbol.
 * TokenIcons are expected to be located at sections/lending/assets/icons/tokens and lowercase named <symbol>.svg
 * @param param0
 * @returns
 */
function SingleTokenIcon({
  symbol,
  aToken,
  size = 24,
  ...rest
}: TokenIconProps) {
  return (
    <Icon
      size={size}
      icon={
        <img
          src={`${CDN_BASE_URL}/v1/assets/${symbol.toLowerCase()}.svg`}
          width="100%"
          height="100%"
          alt={`${symbol} icon`}
        />
      }
      {...rest}
    />
  )
}

interface MultiTokenIconProps {
  symbols: string[]
  badgeSymbol?: string
  aToken?: boolean
}

export function MultiTokenIcon({
  symbols,
  badgeSymbol,
  ...rest
}: MultiTokenIconProps) {
  if (!badgeSymbol)
    return (
      <div css={{ display: "inline-flex", position: "relative" }}>
        {symbols.map((symbol, ix) => (
          <SingleTokenIcon
            {...rest}
            key={symbol}
            symbol={symbol}
            sx={{ ml: ix === 0 ? 0 : `calc(-1 * 0.5em)` }}
          />
        ))}
      </div>
    )
  return (
    <div css={{ display: "inline-flex", position: "relative" }}>
      {symbols.map((symbol, ix) => (
        <SingleTokenIcon
          {...rest}
          key={symbol}
          symbol={symbol}
          sx={{ ml: ix === 0 ? 0 : "calc(-1 * 0.5em)" }}
        />
      ))}
      <div css={{ position: "absolute", right: -4, top: -4 }}>
        <SingleTokenIcon symbol={badgeSymbol} size={16} />
      </div>
    </div>
  )
}

export function TokenIcon({ symbol, ...rest }: TokenIconProps) {
  const symbolChunks = symbol.split("_")
  if (symbolChunks.length > 1) {
    const [badge, ...symbols] = symbolChunks
    return <MultiTokenIcon {...rest} symbols={symbols} badgeSymbol={badge} />
  }
  return <SingleTokenIcon symbol={symbol} {...rest} />
}
