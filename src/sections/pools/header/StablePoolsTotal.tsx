import { HeaderTotalData } from "./PoolsHeaderTotal"
import BN from "bignumber.js"
import { useStablepoolTvlTotal } from "state/store"
import { BN_NAN } from "utils/constants"

export const StablePoolsTotal = () => {
  const tvl = useStablepoolTvlTotal((state) => state.tvl)

  return (
    <HeaderTotalData
      isLoading={!tvl}
      value={tvl ? BN(tvl) : BN_NAN}
      fontSize={[19, 24]}
    />
  )
}
