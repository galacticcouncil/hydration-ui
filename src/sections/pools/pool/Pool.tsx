import { SPoolContainer } from "sections/pools/poolNew/Pool.styled"
import {
  TPool,
  TXYKPool,
  usePoolDetails,
  useXYKPoolDetails,
} from "sections/pools/PoolsPage.utils"
import { PoolDetails } from "sections/pools/poolNew/components/PoolDetails"
import { AvailableFarms } from "sections/pools/poolNew/components/AvailableFarms"
import {
  MyPositions,
  MyXYKPositions,
} from "sections/pools/poolNew/components/MyPositions"
import { isXYKPoolType } from "sections/pools/PoolsPage.utils"
import { PoolSkeleton } from "sections/pools/pool/PoolSkeleton"

export const PoolWrapper = ({ pool }: { pool: TPool | TXYKPool }) => {
  const isXYK = isXYKPoolType(pool)

  return isXYK ? <XYKPool pool={pool} /> : <Pool pool={pool} />
}

const Pool = ({ pool }: { pool: TPool }) => {
  const poolDetails = usePoolDetails(pool.id)

  if (poolDetails.isInitialLoading) return <PoolSkeleton />

  return (
    <SPoolContainer>
      <PoolDetails pool={{ ...pool, ...poolDetails.data }} />
      <MyPositions pool={{ ...pool, ...poolDetails.data }} />
      <AvailableFarms pool={pool} />
    </SPoolContainer>
  )
}

const XYKPool = ({ pool }: { pool: TXYKPool }) => {
  const poolDetails = useXYKPoolDetails(pool)

  if (poolDetails.isInitialLoading) return <PoolSkeleton />

  return (
    <SPoolContainer>
      <PoolDetails pool={{ ...pool, ...poolDetails.data }} />
      <MyXYKPositions pool={{ ...pool }} />
    </SPoolContainer>
  )
}
