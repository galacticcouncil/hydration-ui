import { useMemo } from "react"
import { getFloatingPointAmount } from "utils/balance"
import { useSpotPrice } from "api/spotPrice"
import { useAUSD } from "api/asset"
import { PoolBase, PoolFee } from "@galacticcouncil/sdk"
import BN from "bignumber.js"

type Props = { pool: PoolBase }

export const useTotalInPool = ({ pool }: Props) => {
  const [assetA, assetB] = pool.tokens

  const aUSD = useAUSD()
  const spotAtoAUSD = useSpotPrice(assetA.id, aUSD.data?.id)
  const spotBtoAUSD = useSpotPrice(assetB.id, aUSD.data?.id)

  const queries = [aUSD, spotAtoAUSD, spotBtoAUSD]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (!aUSD.data || !spotAtoAUSD.data || !spotBtoAUSD.data) return undefined

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
    aUSD.data,
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
