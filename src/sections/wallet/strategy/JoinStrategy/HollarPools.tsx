import { TReservesBalance } from "sections/pools/PoolsPage.utils"
import { THollarPool } from "sections/wallet/strategy/StrategyTile/HollarTile"
import { HollarPool } from "./HollarPool"
import { Reserves } from "sections/pools/stablepool/components/Reserves"

type HollarPoolsProps = {
  pools: THollarPool[]
  reserves: TReservesBalance
  selectedPool: THollarPool
  selectPool: (pool: THollarPool) => void
}

export const HollarPools = ({
  pools,
  reserves,
  selectedPool,
  selectPool,
}: HollarPoolsProps) => {
  return (
    <>
      <div sx={{ flex: "column", gap: 8 }}>
        {pools.map((pool, index) => (
          <HollarPool
            key={pool.stablepoolId}
            pool={pool}
            index={index}
            selectedPool={selectedPool}
            setSelected={selectPool}
          />
        ))}
      </div>
      <Reserves reserves={reserves} />
    </>
  )
}
