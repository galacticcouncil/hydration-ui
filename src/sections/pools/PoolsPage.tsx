import { Page } from "components/Page/Page"
import { PoolsHeader } from "sections/pools/header/PoolsHeader"
import { Pool } from "sections/pools/pool/Pool"
import { Box } from "components/Box/Box"
import { usePools } from "api/pools"

export const PoolsPage = () => {
  const pools = usePools()

  return (
    <Page>
      <PoolsHeader />
      <Box flex column gap={20}>
        {pools.data?.map((pool) => (
          <Pool
            key={pool.id.toHuman()}
            id={pool.id}
            assetA={pool.assetA.toHuman()}
            assetB={pool.assetB.toHuman()}
            hasJoinedFarms={false}
            hasLiquidity={false}
          />
        ))}
      </Box>
    </Page>
  )
}
