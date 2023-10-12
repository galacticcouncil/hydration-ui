import { StablePool } from "./StablePool"
import { useStablePools } from "sections/pools/PoolsPage.utils"

export const Stablepools = () => {
  const stablePools = useStablePools()

  return (
    <>
      {stablePools.data?.map((stablePool) => (
        <StablePool key={stablePool.id.toString()} {...stablePool} />
      ))}
    </>
  )
}
