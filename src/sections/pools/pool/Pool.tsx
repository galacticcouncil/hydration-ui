import { FC } from "react"
import { PoolActions } from "sections/pools/pool/actions/PoolActions"
import { PoolIncentives } from "sections/pools/pool/incentives/PoolIncentives"
import { SContainer } from "sections/pools/pool/Pool.styled"
import { PoolClaim } from "sections/pools/pool/claim/PoolClaim"
import { Box } from "components/Box/Box"
import { PoolDetails } from "sections/pools/pool/details/PoolDetails"
import { PoolShares } from "sections/pools/pool/shares/PoolShares"
import { usePoolData } from "sections/pools/pool/Pool.utils"
import { AccountId32 } from "@polkadot/types/interfaces/runtime"
import { u32 } from "@polkadot/types"

export interface PoolConfig {
  id: AccountId32
  assetA: u32
  assetB: u32
  hasJoinedFarms?: boolean
  hasLiquidity?: boolean
}

export const Pool: FC<PoolConfig> = (props) => {
  const { data } = usePoolData(props)

  return (
    <SContainer>
      <Box flex spread p="24px 24px 0" gap={10}>
        {data && (
          <PoolDetails
            assetAName={data.assetA.details?.name ?? "?"}
            assetBName={data.assetB.details?.name ?? "?"}
            totalValue={data.totalValue}
            tradingFee={data.tradingFee}
          />
        )}
        <PoolIncentives id={props.id} />
        <PoolActions {...props} />
      </Box>
      {props.hasLiquidity && <PoolShares />}
      {props.hasJoinedFarms && <PoolClaim />}
    </SContainer>
  )
}
