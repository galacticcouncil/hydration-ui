import { Badge, Box, Icon, IconProps } from "@mui/material"

const CDN_BASE_URL =
  "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest"

interface TokenIconProps extends IconProps {
  symbol: string
  aToken?: boolean
}

/**
 * Renders a tokenIcon specified by symbol.
 * TokenIcons are expected to be located at sections/lending/assets/icons/tokens and lowercase named <symbol>.svg
 * @param param0
 * @returns
 */
function SingleTokenIcon({ symbol, aToken, ...rest }: TokenIconProps) {
  return (
    <Icon
      {...rest}
      sx={{
        display: "flex",
        position: "relative",
        borderRadius: "50%",
        ...rest.sx,
      }}
    >
      <img
        src={`${CDN_BASE_URL}/v1/assets/${symbol.toLowerCase()}.svg`}
        width="100%"
        height="100%"
        alt={`${symbol} icon`}
      />
    </Icon>
  )
}

interface MultiTokenIconProps extends IconProps {
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
      <Box sx={{ display: "inline-flex", position: "relative" }}>
        {symbols.map((symbol, ix) => (
          <SingleTokenIcon
            {...rest}
            key={symbol}
            symbol={symbol}
            sx={{ ml: ix === 0 ? 0 : `calc(-1 * 0.5em)`, ...rest.sx }}
          />
        ))}
      </Box>
    )
  return (
    <Badge
      badgeContent={
        <SingleTokenIcon
          symbol={badgeSymbol}
          sx={{ border: "1px solid #fff" }}
          fontSize="small"
        />
      }
      sx={{ ".MuiBadge-anchorOriginTopRight": { top: 9 } }}
    >
      {symbols.map((symbol, ix) => (
        <SingleTokenIcon
          {...rest}
          key={symbol}
          symbol={symbol}
          sx={{ ml: ix === 0 ? 0 : "calc(-1 * 0.5em)", ...rest.sx }}
        />
      ))}
    </Badge>
  )
}

export function TokenIcon({ symbol, ...rest }: TokenIconProps) {
  const symbolChunks = symbol.split("_")
  if (symbolChunks.length > 1) {
    const [badge, ...symbols] = symbolChunks
    return (
      <MultiTokenIcon
        {...rest}
        symbols={symbols}
        badgeSymbol={"/pools/" + badge}
      />
    )
  }
  return <SingleTokenIcon symbol={symbol} {...rest} />
}
