import { Page } from "components/Layout/Page/Page"
import { PoolsHeader } from "sections/pools/header/PoolsHeader"
import { Pool } from "sections/pools/pool/Pool"
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
      <div sx={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {pools.data?.map((pool) => (
          <Pool key={pool.address} pool={pool} />
        ))}
      </div>
    </Page>
  )
}
