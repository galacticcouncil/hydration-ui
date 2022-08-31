import { FC } from "react"
import { PoolActions } from "sections/pools/pool/actions/PoolActions"
import { PoolIncentives } from "sections/pools/pool/incentives/PoolIncentives"
import { SContainer } from "sections/pools/pool/Pool.styled"
import { PoolClaim } from "sections/pools/pool/claim/PoolClaim"
import { Box } from "components/Box/Box"
import { PoolDetails } from "sections/pools/pool/details/PoolDetails"
import { PoolShares } from "sections/pools/pool/shares/PoolShares"
import { usePoolData } from "sections/pools/pool/Pool.utils"
import { Spinner } from "components/Spinner/Spinner.styled"
import { TRADING_FEE } from "utils/constants"

export interface PoolConfig {
  id: string
  assetA: string
  assetB: string
  hasJoinedFarms?: boolean
  hasLiquidity?: boolean
}

export const Pool: FC<PoolConfig> = (props) => {
  const { data, isLoading } = usePoolData(props)

  return isLoading ? (
    /*TODO: add skeleton loader*/
    <Spinner />
  ) : (
    <SContainer>
      <Box flex spread p="24px 24px 0" gap={10}>
        <PoolDetails
          assetAName={data?.assetA.details?.name ?? ""}
          assetBName={data?.assetB.details?.name ?? ""}
          totalLiquidity={data?.totalLiquidity ?? "0"}
          tradingFee={data?.tradingFee ?? TRADING_FEE}
        />
        <PoolIncentives />
        <PoolActions {...props} />
      </Box>
      {props.hasLiquidity && <PoolShares />}
      {props.hasJoinedFarms && <PoolClaim />}
    </SContainer>
  )
}
