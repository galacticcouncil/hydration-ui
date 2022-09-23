import { FC } from "react"
import { Box } from "components/Box/Box"
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
    <Box flex justify="space-between" acenter>
      <Box flex acenter gap={8}>
        {getAssetLogo(symbol)}
        <Box flex column>
          <Text fs={16}>{symbol}</Text>
          <Text fs={12} color="neutralGray500">
            {name}
          </Text>
        </Box>
      </Box>
      <Text fs={20} lh={26} fw={700}>
        {amount}
      </Text>
    </Box>
  )
}
