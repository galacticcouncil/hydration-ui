import {
  LRNA_ASSET_ID, OMNIPOOL_ACCOUNT,
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
import BigNumber from "bignumber.js";

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
  const omnipoolBalances = useTokensBalances(
    positions.data?.map((p) => p.assetId) ?? [],
    OMNIPOOL_ACCOUNT,
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
    ...omnipoolBalances,
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
      omnipoolBalances.some((q) => !q.data)
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
        const omnipoolBalance = omnipoolBalances.find(
          (b) => b.data?.assetId.toString() === position.assetId.toString(),
        )

        if (
          !meta ||
          !lrnaMeta ||
          !omnipoolAsset?.data ||
          !omnipoolBalance?.data ||
          !math.omnipool
        )
          return null

        const id = position.assetId.toString()
        const symbol = meta.symbol

        const name = getAssetName(meta.symbol)

        const [n,d] = position.price.map(n => new BigNumber(n.toString()))
        const fixedPrice = n.dividedBy(d).multipliedBy(BN_10.pow(18)).toFixed(0).toString()

        const params = [
          omnipoolBalance.data.balance.toString(),
          omnipoolAsset.data.hubReserve.toString(),
          omnipoolAsset.data.shares.toString(),
          position.amount.toString(),
          position.shares.toString(),
          fixedPrice,
          position.shares.toString()
        ]

        const lernaOutResult = math.omnipool.calculate_liquidity_lrna_out.apply(this, params)
        const liquidityOutResult = math.omnipool.calculate_liquidity_out.apply(this, params)
        if (liquidityOutResult === '-1' || lernaOutResult === '-1') {
          console.log('error calculating liquidity out', {liquidityOutResult, lernaOutResult})
          return null
        }

        const lrnaSp = spotPrices.find(
          (sp) => sp.data?.tokenIn === LRNA_ASSET_ID,
        )
        const lrnaDp = BN_10.pow(lrnaMeta.decimals.toBigNumber())
        const lrna = new BN(lernaOutResult).div(lrnaDp)

        const valueSp = spotPrices.find((sp) => sp.data?.tokenIn === id)
        const valueDp = BN_10.pow(meta.decimals.toBigNumber())
        const value = new BN(liquidityOutResult).div(valueDp)
        let valueUSD = BN_NAN

        const price = new BN(fixedPrice).div(BN_10.pow(18))

        const providedAmount = position.amount.toBigNumber().div(valueDp)
        let providedAmountUSD = BN_NAN

        const sharesAmount = position.shares.toBigNumber().div(BN_10.pow(12))

        if (lrnaSp?.data && valueSp?.data)
          valueUSD = value.times(valueSp.data.spotPrice)
            // TODO fix lerna spot price
        if (Number(lrna) > 0)
          console.log("lrna price missing!!!");
            //.plus(lrna.times(lrnaSp.data.spotPrice))

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
    omnipoolBalances,
    spotPrices,
  ])

  return { data, isLoading }
}
