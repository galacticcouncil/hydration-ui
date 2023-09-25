import { calculate_liquidity_out } from "@galacticcouncil/math-omnipool"
import { useAssetDetailsList } from "api/assetDetails"
import { useAssetMetaList } from "api/assetMeta"
import { useTokensBalances } from "api/balances"
import { useApiIds } from "api/consts"
import { useOmnipoolAssets, useOmnipoolPositions } from "api/omnipool"
import { useSpotPrices } from "api/spotPrice"
import { useUniques } from "api/uniques"
import { getVolumeAssetTotalValue, useTradeVolumes } from "api/volume"
import BN from "bignumber.js"
import { useMemo } from "react"
import { HYDRA_TREASURE_ACCOUNT, OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { getFloatingPointAmount } from "utils/balance"
import { BN_0, BN_10, BN_NAN, BN_QUINTILL } from "utils/constants"
import { useDisplayAssetStore } from "utils/displayAsset"
import { isNotNil } from "utils/helpers"

const withoutRefresh = true

export const useOmnipoolOverviewData = () => {
  const omnipoolAssets = useOmnipoolAssets(withoutRefresh)
  const apiIds = useApiIds()
  const displayAsset = useDisplayAssetStore()

  const omnipoolAssetsIds = omnipoolAssets.data?.map((a) => a.id) ?? []

  const volumes = useTradeVolumes(omnipoolAssetsIds, withoutRefresh)

  const assetDetails = useAssetDetailsList(
    omnipoolAssetsIds,
    undefined,
    withoutRefresh,
  )
  const metas = useAssetMetaList([
    displayAsset.stableCoinId,
    ...omnipoolAssetsIds,
  ])

  // get all NFTs on HYDRA_TREASURE_ACCOUNT to calculate POL
  const uniques = useUniques(
    HYDRA_TREASURE_ACCOUNT,
    apiIds.data?.omnipoolCollectionId ?? "",
    withoutRefresh,
  )

  // details of each NFT position of HYDRA_TREASURE_ACCOUNT to calculate POL
  const positions = useOmnipoolPositions(
    uniques.data?.map((u) => u.itemId) ?? [],
    withoutRefresh,
  )

  const omnipoolAssetBalances = useTokensBalances(
    omnipoolAssetsIds,
    OMNIPOOL_ACCOUNT_ADDRESS,
    withoutRefresh,
  )

  const spotPrices = useSpotPrices(
    omnipoolAssetsIds,
    displayAsset.stableCoinId,
    withoutRefresh,
  )

  const queries = [
    omnipoolAssets,
    assetDetails,
    metas,
    apiIds,
    uniques,
    ...spotPrices,
    ...volumes,
    ...positions,
    ...omnipoolAssetBalances,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (
      !omnipoolAssets.data ||
      !assetDetails.data ||
      !metas.data ||
      !apiIds.data ||
      spotPrices.some((q) => !q.data) ||
      omnipoolAssetBalances.some((q) => !q.data) ||
      positions.some((q) => !q.data) ||
      volumes.some((q) => !q.data)
    )
      return []

    // get a price of each position of HYDRA_TREASURE_ACCOUNT and filter it
    const treasurePositionsValue = positions.reduce(
      (acc, query) => {
        const position = query.data
        if (!position) return {}

        const assetId = position.assetId.toString()
        const meta = metas.data.find((m) => m.id.toString() === assetId)

        const omnipoolAsset = omnipoolAssets.data.find(
          (a) => a.id.toString() === assetId,
        )
        const omnipoolBalance = omnipoolAssetBalances.find(
          (b) => b.data?.assetId.toString() === assetId,
        )

        const [nom, denom] = position.price.map((n) => new BN(n.toString()))
        const price = nom.div(denom)
        const positionPrice = price.times(BN_10.pow(18))

        let liquidityOutResult = "-1"

        if (omnipoolBalance?.data && omnipoolAsset?.data) {
          const params: Parameters<typeof calculate_liquidity_out> = [
            omnipoolBalance.data.balance.toString(),
            omnipoolAsset.data.hubReserve.toString(),
            omnipoolAsset.data.shares.toString(),
            position.amount.toString(),
            position.shares.toString(),
            positionPrice.toFixed(0),
            position.shares.toString(),
            "0", // fee zero
          ]
          liquidityOutResult = calculate_liquidity_out.apply(this, params)
        }

        const valueSp = spotPrices.find((sp) => sp?.data?.tokenIn === assetId)
        const valueDp = BN_10.pow(meta?.decimals.toNumber() ?? 12)
        let dollarValue = BN_NAN

        if (liquidityOutResult !== "-1" && valueSp?.data) {
          dollarValue = BN(liquidityOutResult)
            .div(valueDp)
            .times(valueSp.data.spotPrice)
        }

        return { ...acc, [assetId]: dollarValue.plus(acc[assetId] ?? BN_0) }
      },
      {} as { [key: string]: BN },
    )

    const rows = omnipoolAssets.data.map((omnipoolAsset) => {
      const omnipoolAssetId = omnipoolAsset.id.toString()
      const shares = omnipoolAsset.data.shares.toBigNumber()
      const protocolShares = omnipoolAsset.data.protocolShares.toBigNumber()
      const omnipoolAssetCap = omnipoolAsset.data.cap
        .toBigNumber()
        .div(BN_QUINTILL)

      const details = assetDetails.data.find(
        (d) => d.id.toString() === omnipoolAssetId,
      )
      const meta = metas.data?.find((m) => m.id.toString() === omnipoolAssetId)

      const spotPrice = spotPrices.find(
        (sp) => sp?.data?.tokenIn === omnipoolAssetId,
      )?.data?.spotPrice

      const omnipoolAssetBalance = omnipoolAssetBalances.find(
        (b) => b.data?.assetId.toString() === omnipoolAssetId,
      )?.data

      if (!details || !meta || !spotPrice || !omnipoolAssetBalance) return null

      const free = getFloatingPointAmount(
        omnipoolAssetBalance?.freeBalance ?? BN_0,
        meta.decimals.toNumber(),
      ).times(spotPrice)

      const valueOfShares = protocolShares.div(shares).multipliedBy(free)

      const valueOfLiquidityPositions =
        treasurePositionsValue[omnipoolAssetId] ?? BN_0

      const pol = valueOfLiquidityPositions.plus(valueOfShares)

      const tvl = getFloatingPointAmount(
        omnipoolAssetBalance.balance,
        meta?.decimals?.toNumber(),
      ).times(spotPrice)

      // volume calculation
      const volumeEvents = getVolumeAssetTotalValue(
        volumes.find((v) => v.data?.assetId === omnipoolAssetId)?.data,
      )?.[omnipoolAssetId]

      const volume = getFloatingPointAmount(
        volumeEvents ?? BN_0,
        meta?.decimals.toNumber(),
      ).multipliedBy(spotPrice ?? 1)

      return {
        id: omnipoolAssetId,
        name: details?.name,
        symbol: meta?.symbol,
        tvl,
        volume,
        fee: BN(0),
        pol,
        cap: omnipoolAssetCap,
      }
    })
    return rows
  }, [
    apiIds.data,
    assetDetails.data,
    metas.data,
    omnipoolAssetBalances,
    omnipoolAssets.data,
    positions,
    spotPrices,
    volumes,
  ]).filter(isNotNil)

  return { data, isLoading }
}

export type TOmnipoolOverview = typeof useOmnipoolOverviewData
export type TOmnipoolOverviewData = ReturnType<TOmnipoolOverview>["data"]
