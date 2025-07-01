import {
  TAnyPool,
  TPool,
  TXYKPool,
  useStableSwapReserves,
} from "sections/pools/PoolsPage.utils"
import { PoolDetails } from "sections/pools/pool/details/PoolDetails"
import {
  MyPositions,
  MyXYKPositions,
} from "sections/pools/pool/myPositions/MyPositions"
import { isXYKPoolType } from "sections/pools/PoolsPage.utils"
import { PoolSkeleton } from "sections/pools/pool/PoolSkeleton"
import { SPoolContainer } from "./Pool.styled"
import { createContext, useContext } from "react"
import { GigaCampaignBanner } from "sections/pools/components/GigaCampaignBanner"
import { RedepositAllFarmsButton } from "sections/pools/farms/position/redeposit/RedepositAllFarmsButton"

export const PoolContext = createContext<{
  pool: TAnyPool
  isXYK: boolean
}>({
  pool: {} as TAnyPool,
  isXYK: false,
})

export const usePoolData = () => useContext(PoolContext)

export const PoolWrapper = ({ pool }: { pool: TPool | TXYKPool }) => {
  const isXYK = isXYKPoolType(pool)

  return isXYK ? (
    <XYKPool pool={pool} />
  ) : pool.isStablePool ? (
    <Stablepool pool={pool} />
  ) : (
    <Pool pool={pool} />
  )
}

const Pool = ({ pool }: { pool: TPool }) => {
  return (
    <PoolContext.Provider value={{ pool, isXYK: false }}>
      <SPoolContainer>
        <PoolDetails />
        <MyPositions />
      </SPoolContainer>
    </PoolContext.Provider>
  )
}

const Stablepool = ({ pool }: { pool: TPool }) => {
  const poolDetails = useStableSwapReserves(pool.poolId)

  if (poolDetails.isLoading) return <PoolSkeleton />

  return (
    <PoolContext.Provider
      value={{ pool: { ...pool, ...poolDetails.data }, isXYK: false }}
    >
      <div
        sx={{
          display: "grid",
          justify: "center",
          gap: 20,
          mt: -30,
        }}
      >
        <GigaCampaignBanner action={<RedepositAllFarmsButton pool={pool} />} />
        <SPoolContainer>
          <PoolDetails />
          <MyPositions />
        </SPoolContainer>
      </div>
    </PoolContext.Provider>
  )
}

const XYKPool = ({ pool }: { pool: TXYKPool }) => (
  <PoolContext.Provider value={{ pool, isXYK: true }}>
    <SPoolContainer>
      <PoolDetails />
      <MyXYKPositions />
    </SPoolContainer>
  </PoolContext.Provider>
)
