import { Icon } from "components/Icon/Icon"
import { MetadataStore } from "@galacticcouncil/ui"
import { useMemo } from "react"
import { AssetLogo } from "components/AssetIcon/AssetIcon"

const SYMBOL_TO_ASSET_ID_MAP_TESTNET: Record<string, string> = {
  dot: "5",
  usdt: "10",
  usdc: "21",
  weth: "20",
  wbtc: "3",
}

const SYMBOL_TO_ASSET_ID_MAP_MAINNET: Record<string, string> = {
  dot: "5",
  usdt: "10",
  usdc: "22",
  weth: "20",
  wbtc: "19",
}

const SYMBOL_TO_ASSET_ID_MAP =
  import.meta.env.VITE_ENV === "production"
    ? SYMBOL_TO_ASSET_ID_MAP_MAINNET
    : SYMBOL_TO_ASSET_ID_MAP_TESTNET

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
  useMemo(() => {
    MetadataStore.getInstance()
  }, [])
  return (
    <Icon
      size={size}
      icon={<AssetLogo id={SYMBOL_TO_ASSET_ID_MAP[symbol?.toLowerCase()]} />}
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
