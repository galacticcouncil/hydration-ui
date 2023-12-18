import { Text } from "components/Typography/Text/Text"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { useRpcProvider } from "providers/rpcProvider"

type Props = {
  name: string
  symbol: string
  amount: string
  id: string
}

export const RemoveLiquidityReward = ({ name, symbol, amount, id }: Props) => {
  const { assets } = useRpcProvider()
  const meta = assets.getAsset(id)
  const isBond = assets.isBond(meta)
  return (
    <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
      <div sx={{ flex: "row", align: "center", gap: 8 }}>
        {assets.isStableSwap(meta) ? (
          <MultipleIcons
            icons={meta.assets.map((asset: string) => ({
              icon: <AssetLogo id={asset} />,
            }))}
          />
        ) : (
          <Icon
            size={28}
            icon={<AssetLogo id={isBond ? meta.assetId : id} />}
          />
        )}
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
