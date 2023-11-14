import { Text } from "components/Typography/Text/Text"
import { TOmnipoolAsset, TXYKPool } from "sections/pools/PoolsPage.utils"
import { FarmingPositionWrapper } from "sections/pools/farms/FarmingPositionWrapper"
import { LiquidityPositionWrapper } from "sections/pools/pool/positions/LiquidityPositionWrapper"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"

export const MyPositions = ({ pool }: { pool: TOmnipoolAsset | TXYKPool }) => {
  const positions = useOmnipoolPositionsData()

  console.log(positions, "positions")
  return (
    <div>
      <Text fs={15} font="FontOver">
        Your positions
      </Text>
      <LiquidityPositionWrapper
        pool={pool}
        positions={pool.omnipoolNftPositions}
        refetchPositions={() => null}
      />
      <FarmingPositionWrapper pool={pool} />
    </div>
  )
}
