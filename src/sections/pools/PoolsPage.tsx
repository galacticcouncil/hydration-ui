import { Page } from "components/Layout/Page/Page"
import { useState } from "react"
import { useOmnipoolPools } from "sections/pools/PoolsPage.utils"
import { PoolsHeader } from "sections/pools/header/PoolsHeader"
import { Pool } from "sections/pools/pool/Pool"
import { PoolSkeleton } from "./skeleton/PoolSkeleton"
import { useRpcProvider } from "providers/rpcProvider"

const PoolPageContent = () => {
  const [filter, setFilter] = useState({ showMyPositions: false })

  const { data, hasPositionsOrDeposits, isLoading } = useOmnipoolPools(
    filter.showMyPositions,
  )

  return (
    <Page>
      <PoolsHeader
        myPositions={filter.showMyPositions}
        onMyPositionsChange={(value) =>
          setFilter((prev) => ({
            ...prev,
            showMyPositions: value,
          }))
        }
        disableMyPositions={!hasPositionsOrDeposits}
      />

      <div sx={{ flex: "column", gap: 20 }}>
        {!isLoading && data
          ? data.map((pool) => <Pool key={pool.id.toString()} pool={pool} />)
          : [...Array(3)].map((_, index) => (
              <PoolSkeleton key={index} length={3} index={index} />
            ))}
      </div>
    </Page>
  )
}

export const PoolsPage = () => {
  const { isLoaded } = useRpcProvider()

  if (!isLoaded) {
    return (
      <Page>
        <PoolsHeader
          myPositions={false}
          disableMyPositions
          onMyPositionsChange={() => null}
        />
        <div sx={{ flex: "column", gap: 20 }}>
          {[...Array(3)].map((_, index) => (
            <PoolSkeleton key={index} length={3} index={index} />
          ))}
        </div>
      </Page>
    )
  }

  return <PoolPageContent />
}
