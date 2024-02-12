import { Link } from "components/Link/Link"
import { FC } from "react"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"

type AssetNameColumnProps = {
  underlyingAsset: string
  symbol: string
  iconSymbol?: string
}

export const AssetNameColumn: FC<AssetNameColumnProps> = ({
  underlyingAsset,
  symbol,
  iconSymbol,
}) => {
  const { currentMarket } = useProtocolDataContext()
  return (
    <Link to={ROUTES.reserveOverview(underlyingAsset, currentMarket)}>
      <span sx={{ flex: "row", align: "center", gap: 8 }}>
        {iconSymbol && <TokenIcon symbol={iconSymbol} sx={{ fontSize: 24 }} />}
        {symbol}
      </span>
    </Link>
  )
}
