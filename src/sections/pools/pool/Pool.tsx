import { FC } from "react"
import { PoolActions } from "sections/pools/pool/actions/PoolActions"
import { PoolIncentives } from "sections/pools/pool/incentives/PoolIncentives"
import { SContainer } from "sections/pools/pool/Pool.styled"
import { PoolClaim } from "sections/pools/pool/claim/PoolClaim"
import { Box } from "components/Box/Box"
import { PoolDetails } from "sections/pools/pool/details/PoolDetails"
import { PoolShares } from "sections/pools/pool/shares/PoolShares"
import { PoolBase } from "@galacticcouncil/sdk"

type Props = {
  pool: PoolBase
  hasJoinedFarms?: boolean
  hasLiquidity?: boolean
}

export const Pool: FC<Props> = ({ pool, hasJoinedFarms, hasLiquidity }) => {
  return (
    <SContainer>
      <Box flex spread p="24px 24px 0" gap={10}>
        <PoolDetails pool={pool} />
        <PoolIncentives id={pool.address} />
        <PoolActions pool={pool} hasJoinedFarms={hasJoinedFarms} />
      </Box>
      {hasLiquidity && <PoolShares />}
      {hasJoinedFarms && <PoolClaim />}
    </SContainer>
  )
}
