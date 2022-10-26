import { FC } from "react"
import { Text } from "components/Typography/Text/Text"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"

// TODO: add icon handling
type Props = {
  name: string
  symbol: string
  amount: string
}

export const PoolRemoveLiquidityReward: FC<Props> = ({
  name,
  symbol,
  amount,
}) => {
  return (
    <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
      <div sx={{ flex: "row", align: "center", gap: 8 }}>
        {getAssetLogo(symbol)}
        <div sx={{ flex: "column" }}>
          <Text fs={[14, 16]}>{symbol}</Text>
          <Text fs={[10, 12]} color="neutralGray500">
            {name}
          </Text>
        </div>
      </div>
      <Text fs={[16, 20]} lh={26} fw={[500, 700]}>
        {amount}
      </Text>
    </div>
  )
}
