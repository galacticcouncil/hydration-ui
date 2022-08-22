import { FC, useState } from "react"
import { PoolActions } from "sections/pools/pool/actions/PoolActions"
import { PoolIncentives } from "sections/pools/pool/incentives/PoolIncentives"
import { SContainer } from "sections/pools/pool/Pool.styled"
import { PoolClaim } from "sections/pools/pool/claim/PoolClaim"
import { Box } from "components/Box/Box"
import { PoolDetails } from "sections/pools/pool/details/PoolDetails"
import { PoolShares } from "sections/pools/pool/shares/PoolShares"

type Props = { hasJoinedFarms: boolean; hasLiquidity: boolean }

export const Pool: FC<Props> = ({ hasJoinedFarms, hasLiquidity }) => {
  const [openCard, setOpenCard] = useState(false)

  return (
    <SContainer>
      <Box flex spread p={"22px 26px 0"} gap={10}>
        <PoolDetails />
        <PoolIncentives />
        <PoolActions
          hasJoinedFarms={hasJoinedFarms}
          closeCard={() => setOpenCard(false)}
        />
      </Box>
      {hasLiquidity && <PoolShares />}
      {hasJoinedFarms && <PoolClaim />}
    </SContainer>
  )
}
