import { Link } from "components/Link/Link"
import { FC } from "react"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"

type AssetNameColumnProps = {
  detailsAddress: string
  symbol: string
  aToken?: boolean
}

export const AssetNameColumn: FC<AssetNameColumnProps> = ({
  detailsAddress,
  symbol,
  aToken,
}) => {
  const { currentMarket } = useProtocolDataContext()

  return (
    <Link to={ROUTES.reserveOverview(detailsAddress, currentMarket)}>
      <span sx={{ flex: "row", align: "center", gap: 8 }}>
        <TokenIcon address={detailsAddress} aToken={aToken} />
        {symbol}
      </span>
    </Link>
  )
}
