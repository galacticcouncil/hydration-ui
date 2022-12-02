import { Page } from "components/Layout/Page/Page"
import { PoolsHeader } from "sections/pools/header/PoolsHeader"
import { useState } from "react"
import { Pool } from "sections/pools/pool/Pool"
import { useOmnipoolPools } from "sections/pools/PoolsPage.utils"

export const PoolsPage = () => {
  const [filter, setFilter] = useState({ showMyPositions: false })

  const pools = useOmnipoolPools()

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
      {pools.isLoading ? (
        <div>TODO: skeleton loader</div>
      ) : (
        pools.data && (
          <div sx={{ flex: "column", gap: 20 }}>
            {pools.data.map((pool) => (
              <Pool key={pool.id.toString()} pool={pool} />
            ))}
          </div>
        )
      )}
    </Page>
  )
}
