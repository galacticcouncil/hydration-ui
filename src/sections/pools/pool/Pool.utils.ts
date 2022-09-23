import { useMemo } from "react"
import { getBalanceAmount } from "utils/balance"
import { useSpotPrice } from "api/spotPrice"
import { useAUSD } from "api/asset"
import { PoolBase } from "@galacticcouncil/sdk"
import BN from "bignumber.js"

type Props = { pool: PoolBase }

export const useTotalInPool = ({ pool }: Props) => {
  const [assetA, assetB] = pool.tokens

  const aUSD = useAUSD()
  const spotAtoAUSD = useSpotPrice(assetA.id, aUSD.data?.token)
  const spotBtoAUSD = useSpotPrice(assetB.id, aUSD.data?.token)

  const queries = [aUSD, spotAtoAUSD, spotBtoAUSD]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (!aUSD.data || !spotAtoAUSD.data || !spotBtoAUSD.data) return undefined

    const balanceA = getBalanceAmount(new BN(assetA.balance), assetA.decimals)
    const balanceB = getBalanceAmount(new BN(assetB.balance), assetA.decimals)

    const AtoAUSD = spotAtoAUSD.data.spotPrice
    const BtoAUSD = spotBtoAUSD.data.spotPrice

    const totalA = balanceA.times(AtoAUSD)
    const totalB = balanceB.times(BtoAUSD)
    const total = totalA.plus(totalB)

    return total
  }, [aUSD.data, spotAtoAUSD.data, spotBtoAUSD.data])

  return { data, isLoading }
}
