import { useMemo } from "react"
import { AUSD_NAME, BN_0 } from "utils/constants"
import { getBalanceAmount } from "utils/balance"
import { useSpotPrice } from "api/spotPrice"
import { useAssets } from "api/asset"
import { PoolBase } from "@galacticcouncil/sdk"
import BN from "bignumber.js"

type Props = { pool: PoolBase }

export const usePoolTotalValue = ({ pool }: Props) => {
  const [assetA, assetB] = pool.tokens

  const assets = useAssets()
  const aUSD = assets.data?.find(
    (a) => a.symbol.toLowerCase() === AUSD_NAME.toLowerCase(),
  )?.token

  const spotAtoAUSD = useSpotPrice(assetA.id, aUSD)
  const spotBtoAUSD = useSpotPrice(assetB.id, aUSD)

  const queries = [assets, spotAtoAUSD, spotBtoAUSD]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (queries.some((q) => !q.data)) return undefined

    const balanceA = getBalanceAmount(new BN(assetA.balance), assetA.decimals)
    const balanceB = getBalanceAmount(new BN(assetB.balance), assetA.decimals)

    const AtoAUSD = spotAtoAUSD.data?.spotPrice
    const BtoAUSD = spotBtoAUSD.data?.spotPrice

    const totalA = balanceA.times(AtoAUSD ?? BN_0)
    const totalB = balanceB.times(BtoAUSD ?? BN_0)
    const total = totalA.plus(totalB)

    return total
  }, [assets.data, spotAtoAUSD.data, spotBtoAUSD.data])

  return { data, isLoading }
}
