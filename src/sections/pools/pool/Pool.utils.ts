import { useMemo } from "react"
import { getFloatingPointAmount } from "utils/balance"
import { useSpotPrice } from "api/spotPrice"
import { PoolBase, PoolFee } from "@galacticcouncil/sdk"
import BN from "bignumber.js"
import { useApiIds } from "api/consts"

type Props = { pool: PoolBase }

export const useTotalInPool = ({ pool }: Props) => {
  const [assetA, assetB] = pool.tokens

  const apiIds = useApiIds()
  const spotAtoAUSD = useSpotPrice(assetA.id, apiIds.data?.usdId)
  const spotBtoAUSD = useSpotPrice(assetB.id, apiIds.data?.usdId)

  const queries = [apiIds, spotAtoAUSD, spotBtoAUSD]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (!apiIds.data || !spotAtoAUSD.data || !spotBtoAUSD.data) return undefined

    const balanceA = getFloatingPointAmount(
      new BN(assetA.balance),
      assetA.decimals,
    )
    const balanceB = getFloatingPointAmount(
      new BN(assetB.balance),
      assetA.decimals,
    )

    const AtoAUSD = spotAtoAUSD.data.spotPrice
    const BtoAUSD = spotBtoAUSD.data.spotPrice

    const totalA = balanceA.times(AtoAUSD)
    const totalB = balanceB.times(BtoAUSD)
    const total = totalA.plus(totalB)

    return total
  }, [
    apiIds.data,
    assetA.balance,
    assetA.decimals,
    assetB.balance,
    spotAtoAUSD.data,
    spotBtoAUSD.data,
  ])

  return { data, isLoading }
}

export const getTradeFee = (fee?: PoolFee) => {
  if (fee?.length !== 2) return "-"

  const numerator = new BN(fee[0])
  const denominator = new BN(fee[1])
  const tradeFee = numerator.div(denominator)

  return tradeFee.times(100)
}
