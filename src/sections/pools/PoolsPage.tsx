import { Page } from "components/Layout/Page/Page"
import { PoolsHeader } from "sections/pools/header/PoolsHeader"
import { useState } from "react"
import { Pool } from "sections/pools/pool/Pool"
import { useOmnipoolPools } from "sections/pools/PoolsPage.utils"
import { PoolSkeleton } from "./skeleton/PoolSkeleton"

const SKELETON_AMOUNT = 3

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
      <div sx={{ flex: "column", gap: 20 }}>
        {!pools.isLoading && pools.data
          ? pools.data.map((pool) => (
              <Pool key={pool.id.toString()} pool={pool} />
            ))
          : [...Array(SKELETON_AMOUNT)].map((_, index) => (
              <PoolSkeleton
                key={index}
                length={SKELETON_AMOUNT}
                index={index}
              />
            ))}
      </div>
    </Page>
  )
}
