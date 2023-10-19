import { Page } from "components/Layout/Page/Page"
import { useState } from "react"
import {
  isStablepool,
  sortPools,
  useOmnipoolPools,
  useStablePools,
} from "sections/pools/PoolsPage.utils"
import { PoolsHeader } from "sections/pools/header/PoolsHeader"
import { Pool } from "sections/pools/pool/Pool"
import { useRpcProvider } from "providers/rpcProvider"
import { StablePool } from "./stablepool/StablePool"
import { PoolsSkeleton } from "./skeleton/PoolsSkeleton"

const PoolPageContent = () => {
  const [filter, setFilter] = useState({ showMyPositions: false })

  const { data, hasPositionsOrDeposits, isLoading } = useOmnipoolPools(
    filter.showMyPositions,
  )

  const stablePools = useStablePools(filter.showMyPositions)
  const all = sortPools([...(stablePools?.data ?? []), ...(data ?? [])])

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
        {isLoading && <PoolsSkeleton />}
        {all.map((pool) =>
          isStablepool(pool) ? (
            <StablePool key={pool.id.toString()} pool={pool} />
          ) : (
            <Pool key={pool.id.toString()} pool={pool} />
          ),
        )}
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
          <PoolsSkeleton />
        </div>
      </Page>
    )
  }

  return <PoolPageContent />
}
