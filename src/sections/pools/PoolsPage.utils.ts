import { useOmnipoolAssets } from "api/omnipool"
import { useMemo } from "react"
import { useAssetMetaList } from "api/assetMeta"
import { BN_0, BN_NAN, TRADING_FEE } from "utils/constants"
import BN from "bignumber.js"
import { u32 } from "@polkadot/types-codec"
import { useTokensBalances } from "api/balances"
import { useSpotPrices } from "api/spotPrice"
import { useUsdPeggedAsset } from "api/asset"
import { getFloatingPointAmount } from "utils/balance"
import {
  is_add_liquidity_allowed,
  is_buy_allowed,
  is_remove_liquidity_allowed,
  is_sell_allowed,
} from "@galacticcouncil/math/build/omnipool/bundler/hydra_dx_wasm"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"

export const useOmnipoolPools = () => {
  const assets = useOmnipoolAssets()
  const metas = useAssetMetaList(assets.data?.map((a) => a.id) ?? [])
  const usd = useUsdPeggedAsset()
  const spotPrices = useSpotPrices(
    assets.data?.map((a) => a.id) ?? [],
    usd.data?.id,
  )
  const balances = useTokensBalances(
    assets.data?.map((a) => a.id) ?? [],
    OMNIPOOL_ACCOUNT_ADDRESS,
  )

  const queries = [assets, metas, usd, ...spotPrices, ...balances]
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

        // if (!meta || !balance) return null

        const id = asset.id
        const symbol = meta?.symbol ?? "N/A"
        const tradeFee = TRADING_FEE

        const total = getFloatingPointAmount(
          balance ?? BN_0,
          meta?.decimals?.toNumber() ?? 12,
        )
        const totalUSD = !spotPrice ? BN_NAN : total.times(spotPrice)

        const volume24h = BN_NAN // TODO

        const bits = asset.data.tradable.bits.toNumber()
        const canSell = is_sell_allowed(bits)
        const canBuy = is_buy_allowed(bits)
        const canAddLiquidity = is_add_liquidity_allowed(bits)
        const canRemoveLiquidity = is_remove_liquidity_allowed(bits)

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
  }, [assets.data, metas.data, usd.data, spotPrices, balances])

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
