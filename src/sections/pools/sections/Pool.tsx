import { TOmnipoolAsset, TXYKPool } from "sections/pools/PoolsPage.utils"
import { isXYKPool } from "sections/pools/PoolsPage.utils"
import { XYKPool } from "sections/pools/pool/xyk/XYKPool"
import { Pool } from "sections/pools/pool/Pool"

export const PoolTest = ({ pool }: { pool: TOmnipoolAsset | TXYKPool }) => {
  console.log(pool, "pool")
  if (isXYKPool(pool)) return <XYKPool pool={pool} />

  return <Pool pool={pool} />
}
