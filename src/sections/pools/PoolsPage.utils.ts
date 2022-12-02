import { useOmnipoolAssets } from "api/omnipool"
import { useMemo } from "react"
import { useAssetMetaList } from "api/assetMeta"
import { BN_10, BN_NAN, OMNIPOOL_ADDRESS, TRADING_FEE } from "utils/constants"
import { useMath } from "utils/api"
import BN from "bignumber.js"
import { u32 } from "@polkadot/types-codec"
import { useTokensBalances } from "api/balances"
import { useSpotPrices } from "api/spotPrice"
import { useUsdPeggedAsset } from "api/asset"

export const useOmnipoolPools = () => {
  const math = useMath()
  const assets = useOmnipoolAssets()
  const metas = useAssetMetaList(assets.data?.map((a) => a.id) ?? [])
  const usd = useUsdPeggedAsset()
  const spotPrices = useSpotPrices(
    assets.data?.map((a) => a.id) ?? [],
    usd.data?.id,
  )
  const balances = useTokensBalances(
    assets.data?.map((a) => a.id) ?? [],
    OMNIPOOL_ADDRESS,
  )

  const queries = [assets, metas, math, usd, ...spotPrices, ...balances]
  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !assets.data ||
      !metas.data ||
      !usd.data ||
      spotPrices.some((q) => !q.data) ||
      balances.some((b) => !b.data)
    )
      return undefined

    const rows: OmnipoolPool[] = assets.data
      .map((asset) => {
        const meta = metas.data?.find(
          (m) => m.id.toString() === asset.id.toString(),
        )
        const spotPrice = spotPrices.find(
          (sp) => sp.data?.tokenIn === asset.id.toString(),
        )?.data?.spotPrice
        const balance = balances.find(
          (b) => b.data?.assetId.toString() === asset.id.toString(),
        )?.data?.balance

        if (!meta || !balance || !math.omnipool) return null

        const id = asset.id
        const symbol = meta.symbol
        const tradeFee = TRADING_FEE

        const dp = BN_10.pow(meta.decimals.toBigNumber())
        const total = balance.div(dp)
        const totalUSD = !spotPrice ? BN_NAN : total.times(spotPrice)

        const volume24h = BN_NAN // TODO

        const tradability = new math.omnipool.Tradability(
          asset.data.tradable.bits.toNumber(),
        )
        const canSell = tradability.can_sell()
        const canBuy = tradability.can_buy()
        const canAddLiquidity = tradability.can_add_liquidity()
        const canRemoveLiquidity = tradability.can_remove_liquidity()

        return {
          id,
          symbol,
          tradeFee,
          total,
          totalUSD,
          volume24h,
          canSell,
          canBuy,
          canAddLiquidity,
          canRemoveLiquidity,
        }
      })
      .filter((x): x is OmnipoolPool => x !== null)

    return rows
  }, [assets.data, metas.data, usd.data, spotPrices, balances, math.omnipool])

  return { data, isLoading: isInitialLoading }
}

export type OmnipoolPool = {
  id: u32
  symbol: string
  tradeFee: BN
  total: BN
  totalUSD: BN
  volume24h: BN
  canSell: boolean
  canBuy: boolean
  canAddLiquidity: boolean
  canRemoveLiquidity: boolean
}
