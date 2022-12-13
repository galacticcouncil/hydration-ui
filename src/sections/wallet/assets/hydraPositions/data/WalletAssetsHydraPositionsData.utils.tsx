import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
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
import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math/build/omnipool/bundler/hydra_dx_wasm"
import { useApiIds } from "api/consts"

export const useHydraPositionsData = () => {
  const { account } = useAccountStore()
  const apiIds = useApiIds()
  const uniques = useUniques(
    account?.address ?? "",
    apiIds.data?.omnipoolCollectionId ?? "",
  )
  const positions = useOmnipoolPositions(
    uniques.data?.map((u) => u.itemId) ?? [],
  )
  const metas = useAssetMetaList([
    apiIds.data?.usdId,
    apiIds.data?.lrnaId,
    ...(positions.data?.map((p) => p.assetId) ?? []),
  ])
  const omnipoolAssets = useOmnipoolAssets()
  const omnipoolBalances = useTokensBalances(
    positions.data?.map((p) => p.assetId) ?? [],
    OMNIPOOL_ACCOUNT_ADDRESS,
  )
  const spotPrices = useSpotPrices(
    [apiIds.data?.lrnaId, ...(positions.data?.map((p) => p.assetId) ?? [])],
    apiIds.data?.usdId,
  )

  const queries = [
    apiIds,
    uniques,
    positions,
    metas,
    omnipoolAssets,
    ...omnipoolBalances,
    ...spotPrices,
  ]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !uniques.data ||
      !positions.data ||
      !metas.data ||
      !omnipoolAssets.data ||
      !apiIds.data ||
      omnipoolBalances.some((q) => !q.data)
    )
      return []

    const rows: HydraPositionsTableData[] = positions.data
      .map((position) => {
        const meta = metas.data.find(
          (m) => m.id.toString() === position.assetId.toString(),
        )
        const lrnaMeta = metas.data.find(
          (m) => m.id.toString() === apiIds.data.lrnaId,
        )
        const omnipoolAsset = omnipoolAssets.data.find(
          (a) => a.id.toString() === position.assetId.toString(),
        )
        const omnipoolBalance = omnipoolBalances.find(
          (b) => b.data?.assetId.toString() === position.assetId.toString(),
        )

        if (
          !meta ||
          !lrnaMeta ||
          !omnipoolAsset?.data ||
          !omnipoolBalance?.data
        )
          return null

        const id = position.assetId.toString()
        const symbol = meta.symbol
        const name = getAssetName(meta.symbol)

        const [nom, denom] = position.price.map((n) => new BN(n.toString()))
        const price = nom.div(denom)
        const positionPrice = price.times(BN_10.pow(18))

        const params: [
          asset_reserve: string,
          asset_hub_reserve: string,
          asset_shares: string,
          position_amount: string,
          position_shares: string,
          position_price: string,
          shares_to_remove: string,
        ] = [
          omnipoolBalance.data.balance.toString(),
          omnipoolAsset.data.hubReserve.toString(),
          omnipoolAsset.data.shares.toString(),
          position.amount.toString(),
          position.shares.toString(),
          positionPrice.toFixed(),
          position.shares.toString(),
        ]

        const lernaOutResult = calculate_liquidity_lrna_out.apply(this, params)
        const liquidityOutResult = calculate_liquidity_out.apply(this, params)
        if (liquidityOutResult === "-1" || lernaOutResult === "-1") return null

        const lrnaSp = spotPrices.find(
          (sp) => sp.data?.tokenIn === apiIds.data.lrnaId,
        )
        const lrnaDp = BN_10.pow(lrnaMeta.decimals.toBigNumber())
        const lrna = new BN(lernaOutResult).div(lrnaDp)

        const valueSp = spotPrices.find((sp) => sp.data?.tokenIn === id)
        const valueDp = BN_10.pow(meta.decimals.toBigNumber())
        const value = new BN(liquidityOutResult).div(valueDp)
        let valueUSD = BN_NAN

        const providedAmount = position.amount.toBigNumber().div(valueDp)
        let providedAmountUSD = BN_NAN

        const sharesAmount = position.shares.toBigNumber().div(BN_10.pow(12))

        if (lrnaSp?.data && valueSp?.data)
          valueUSD = value
            .times(valueSp.data.spotPrice)
            .plus(lrna.times(lrnaSp.data.spotPrice))

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
    uniques.data,
    positions.data,
    metas.data,
    omnipoolAssets.data,
    apiIds.data,
    omnipoolBalances,
    spotPrices,
  ])

  return { data, isLoading }
}
