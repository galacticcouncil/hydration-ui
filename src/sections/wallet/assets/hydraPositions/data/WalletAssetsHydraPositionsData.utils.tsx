import {
  LRNA_ASSET_ID,
  OMNIPOOL_POSITION_COLLECTION_ID,
  useMath,
} from "utils/api"
import { useAccountStore } from "state/store"
import { useMemo } from "react"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { useAssetMetaList } from "api/assetMeta"
import { getAssetName } from "components/AssetIcon/AssetIcon"
import BN from "bignumber.js"
import { useTokensBalances } from "api/balances"
import { BN_10, BN_NAN } from "utils/constants"
import { useUniques } from "api/uniques"
import { useOmnipoolAssets, useOmnipoolPositions } from "api/omnipool"
import { useSpotPrices } from "api/spotPrice"
import { useUsdPeggedAsset } from "api/asset"

export const useAssetsHydraPositionsData = () => {
  const { account } = useAccountStore()
  const math = useMath()
  const uniques = useUniques(
    account?.address ?? "",
    OMNIPOOL_POSITION_COLLECTION_ID,
  )
  const positions = useOmnipoolPositions(
    uniques.data?.map((u) => u.itemId) ?? [],
  )
  const metas = useAssetMetaList([
    LRNA_ASSET_ID,
    ...(positions.data?.map((p) => p.assetId) ?? []),
  ])
  const omnipoolAssets = useOmnipoolAssets()
  const balances = useTokensBalances(
    positions.data?.map((p) => p.assetId) ?? [],
    account?.address,
  )
  const usd = useUsdPeggedAsset()
  const spotPrices = useSpotPrices(
    [LRNA_ASSET_ID, ...(positions.data?.map((p) => p.assetId) ?? [])],
    usd.data?.id,
  )

  const queries = [
    math,
    uniques,
    positions,
    metas,
    omnipoolAssets,
    ...balances,
    usd,
    ...spotPrices,
  ]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !math.omnipool ||
      !uniques.data ||
      !positions.data ||
      !metas.data ||
      !omnipoolAssets.data ||
      balances.some((q) => !q.data)
    )
      return []

    const rows: HydraPositionsTableData[] = positions.data
      .map((position) => {
        const meta = metas.data.find(
          (m) => m.id.toString() === position.assetId.toString(),
        )
        const lrnaMeta = metas.data.find(
          (m) => m.id.toString() === LRNA_ASSET_ID,
        )
        const omnipoolAsset = omnipoolAssets.data.find(
          (a) => a.id.toString() === position.assetId.toString(),
        )
        const balance = balances.find(
          (b) => b.data?.assetId.toString() === position.assetId.toString(),
        )

        if (
          !meta ||
          !lrnaMeta ||
          !omnipoolAsset?.data ||
          !balance?.data ||
          !math.omnipool
        )
          return null

        const id = position.assetId.toString()
        const symbol = meta.symbol

        const name = getAssetName(meta.symbol)

        const omniAssetState = new math.omnipool.AssetState(
          balance.data.balance.toString(),
          omnipoolAsset.data.hubReserve.toString(),
          omnipoolAsset.data.shares.toString(),
        )
        const omniPosition = new math.omnipool.Position(
          position.amount.toString(),
          position.shares.toString(),
          position.price.toString(),
        )
        const liquidityOutResult = math.omnipool.calculate_liquidity_out(
          omniAssetState,
          omniPosition,
          position.shares.toString(),
        )

        if (liquidityOutResult.is_error()) return null

        const lrnaSp = spotPrices.find(
          (sp) => sp.data?.tokenIn === LRNA_ASSET_ID,
        )
        const lrnaDp = BN_10.pow(lrnaMeta.decimals.toBigNumber())
        const lrna = new BN(liquidityOutResult.get_lrna_amount()).div(lrnaDp)

        const valueSp = spotPrices.find((sp) => sp.data?.tokenIn === id)
        const valueDp = BN_10.pow(meta.decimals.toBigNumber())
        const value = new BN(liquidityOutResult.get_asset_amount()).div(valueDp)
        let valueUSD = BN_NAN

        const price = position.price.toBigNumber().div(BN_10.pow(18))

        const providedAmount = position.amount.toBigNumber().div(valueDp)
        let providedAmountUSD = BN_NAN

        const sharesAmount = position.shares.toBigNumber().div(BN_10.pow(12))

        if (lrnaSp?.data && valueSp?.data)
          valueUSD = lrna
            .times(lrnaSp.data.spotPrice)
            .plus(value.times(valueSp.data.spotPrice))

        if (valueSp?.data)
          providedAmountUSD = providedAmount.times(valueSp.data.spotPrice)

        const result = {
          id,
          symbol,
          name,
          lrna,
          value,
          valueUSD,
          price,
          providedAmount,
          providedAmountUSD,
          sharesAmount,
        }

        return result
      })
      .filter((x): x is HydraPositionsTableData => x !== null)

    return rows
  }, [
    math.omnipool,
    uniques.data,
    positions.data,
    metas.data,
    omnipoolAssets.data,
    balances,
    spotPrices,
  ])

  return { data, isLoading }
}
