import { Page } from "components/Layout/Page/Page"
import { useState } from "react"
import {
  useOmnipoolPools,
  useOmnipoolStablePools,
} from "sections/pools/PoolsPage.utils"
import { PoolsHeader } from "sections/pools/header/PoolsHeader"
import { Pool } from "sections/pools/pool/Pool"
import { useApiPromise } from "utils/api"
import { PoolSkeleton } from "./skeleton/PoolSkeleton"
import { StablePool } from "./stablepool/StablePool"

const PoolPageContent = () => {
  const [filter, setFilter] = useState({ showMyPositions: false })

  const stablePools = useOmnipoolStablePools()

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
        {stablePools.data?.map((stablePool) => (
          <StablePool key={stablePool.id.toString()} id={stablePool.id} tradeFee={stablePool.tradeFee} assets={stablePool.assets} />
        ))}
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
  const api = useApiPromise()

  if (!Object.keys(api).length) {
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
