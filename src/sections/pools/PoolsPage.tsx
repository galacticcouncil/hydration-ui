import { Page } from "components/Page/Page"
import { PoolsHeader } from "sections/pools/header/PoolsHeader"
import { Pool } from "sections/pools/pool/Pool"
import { Box } from "components/Box/Box"
import { useState } from "react"
import {
  PoolsPageFilter,
  useFilteredPools,
} from "sections/pools/PoolsPage.utils"

export const PoolsPage = () => {
  const [filter, setFilter] = useState<PoolsPageFilter>({
    showMyPositions: false,
  })

  const pools = useFilteredPools(filter)

  return (
    <Page>
      <PoolsHeader
        showMyPositions={filter.showMyPositions}
        onShowMyPositionsChange={(value) =>
          setFilter((prev) => ({
            ...prev,
            showMyPositions: value,
          }))
        }
      />
      <Box flex column gap={20}>
        {pools.data?.map((pool) => (
          <Pool key={pool.address} pool={pool} />
        ))}
      </Box>
    </Page>
  )
}
