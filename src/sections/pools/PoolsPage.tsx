import { Page } from "components/Layout/Page/Page"
import { PoolsHeader } from "sections/pools/header/PoolsHeader"
import { Pool } from "sections/pools/pool/Pool"
import { useState } from "react"
import {
  PoolsPageFilter,
  useFilteredPools,
} from "sections/pools/PoolsPage.utils"
import { Spinner } from "components/Spinner/Spinner.styled"

export const PoolsPage = () => {
  const [filter, setFilter] = useState<PoolsPageFilter>({
    showMyPositions: false,
  })

  const { data, isLoading } = useFilteredPools(filter)

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
        {isLoading ? (
          <div sx={{ width: "100%", flex: "row", justify: "center" }}>
            <Spinner width={32} height={32} />
          </div>
        ) : (
          data?.map((pool) => <Pool key={pool.address} pool={pool} />)
        )}
      </div>
    </Page>
  )
}
