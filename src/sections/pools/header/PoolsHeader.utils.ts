import { usePools } from "api/pools"
import { getBalanceAmount } from "utils/balance"
import { AUSD_NAME, BN_0 } from "utils/constants"
import { useMemo } from "react"
import BN from "bignumber.js"
import { useAssets } from "api/asset"
import { useSpotPrices } from "api/spotPrice"

export const useTotalLiquidity = () => {
  const pools = usePools()
  const assets = useAssets()
  const aUSD = assets.data?.find(
    (asset) => asset.symbol.toLowerCase() === AUSD_NAME.toLowerCase(),
  )?.token
  const spotPrices = useSpotPrices(
    assets.data?.map((asset) => asset.token) ?? [],
    aUSD,
  )

  const queries = [pools, assets, ...spotPrices]
  const isLoading = queries.map((q) => q.isLoading)

  const data = useMemo(() => {
    if (queries.some((q) => !q.data)) return undefined

    const totals = pools.data?.map((pool) => {
      const [assetA, assetB] = pool.tokens
      const amountA = getBalanceAmount(new BN(assetA.balance), assetA.decimals)
      const amountB = getBalanceAmount(new BN(assetB.balance), assetB.decimals)
      const spotPriceA = spotPrices.find((sp) => sp.data?.tokenIn === assetA.id)
      const spotPriceB = spotPrices.find((sp) => sp.data?.tokenIn === assetB.id)
      const totalA = amountA.times(spotPriceA?.data?.spotPrice ?? BN_0)
      const totalB = amountB.times(spotPriceB?.data?.spotPrice ?? BN_0)
      const total = totalA.plus(totalB)

      // const a = assetA.symbol
      // const b = assetB.symbol
      // console.table([
      //   [`${a} amount`, amountA.toFixed()],
      //   [`${b} amount`, amountB.toFixed()],
      //   [`${a} spot price`, spotPriceA?.data?.spotPrice.toFixed()],
      //   [`${b} spot price`, spotPriceB?.data?.spotPrice.toFixed()],
      //   [`${a} total`, totalA.toFixed()],
      //   [`${b} total`, totalB.toFixed()],
      //   [`Total`, total.toFixed()],
      // ])

      return total
    })

    return totals?.reduce((acc, total) => acc.plus(total), BN_0)
  }, [pools.data, assets.data, spotPrices.map((sp) => sp.data)])

  return { data, isLoading }
}
