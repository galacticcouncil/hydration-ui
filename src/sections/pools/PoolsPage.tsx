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
            key={pool.id}
            id={pool.id}
            assetA={pool.assetA}
            assetB={pool.assetB}
            hasJoinedFarms={false}
            hasLiquidity={false}
          />
        ))}
      </Box>
    </Page>
  )
}
