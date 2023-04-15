import { Button } from "components/Button/Button"
import { Page } from "components/Layout/Page/Page"
import { ModalTest } from "components/Modal/new/Modal"
import { useState } from "react"
import { useOmnipoolPools } from "sections/pools/PoolsPage.utils"
import { PoolsHeader } from "sections/pools/header/PoolsHeader"
import { Pool } from "sections/pools/pool/Pool"
import { PoolSkeleton } from "./skeleton/PoolSkeleton"

export const PoolsPage = () => {
  const [filter, setFilter] = useState({ showMyPositions: false })

  const { data, hasPositionsOrDeposits, isLoading } = useOmnipoolPools(
    filter.showMyPositions,
  )

  const [open, setOpen] = useState(false)

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

      <div sx={{ my: 32 }}>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Open Modal
        </Button>
        <ModalTest open={open} onClose={() => setOpen(false)} />
      </div>

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
