import { calculate_liquidity_out } from "@galacticcouncil/math-omnipool"
import { useTokensBalances } from "api/balances"
import { useApiIds } from "api/consts"
import { useOmnipoolAssets, useOmnipoolPositions } from "api/omnipool"
import { useSpotPrices } from "api/spotPrice"
import { useUniques } from "api/uniques"
import { useVolumes } from "api/volume"
import BN from "bignumber.js"
import { useMemo } from "react"
import {
  HYDRA_TREASURE_ACCOUNT,
  NATIVE_ASSET_ID,
  OMNIPOOL_ACCOUNT_ADDRESS,
} from "utils/api"
import { getFloatingPointAmount } from "utils/balance"
import { BN_0, BN_10, BN_NAN, BN_QUINTILL } from "utils/constants"
import { useDisplayAssetStore } from "utils/displayAsset"
import { isNotNil } from "utils/helpers"
import { useRpcProvider } from "providers/rpcProvider"
import { useTVLs } from "api/stats"

const withoutRefresh = true

export const useOmnipoolAssetDetails = (sortBy: "tvl" | "pol") => {
  const { assets } = useRpcProvider()
  const apiIds = useApiIds()
  const omnipoolAssets = useOmnipoolAssets(withoutRefresh)
  const displayAsset = useDisplayAssetStore()

  const omnipoolAssetsIds =
    omnipoolAssets.data?.map((a) => a.id.toString()) ?? []

  const volumes = useVolumes(omnipoolAssetsIds)
  const tvls = useTVLs(omnipoolAssetsIds)

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
    apiIds,
    uniques,
    ...spotPrices,
    ...volumes,
    ...tvls,
    ...positions,
    ...omnipoolAssetBalances,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (
      !omnipoolAssets.data ||
      !apiIds.data ||
      spotPrices.some((q) => !q.data) ||
      omnipoolAssetBalances.some((q) => !q.data) ||
      positions.some((q) => !q.data) ||
      volumes.some((q) => !q.data) ||
      tvls.some((q) => !q.data)
    )
      return []

    // get a price of each position of HYDRA_TREASURE_ACCOUNT and filter it
    const treasurePositionsValue = positions.reduce(
      (acc, query) => {
        const position = query.data
        if (!position) return {}

        const assetId = position.assetId.toString()
        const meta = assets.getAsset(assetId)

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
        const valueDp = BN_10.pow(meta.decimals)
        let valueUSD = BN_NAN

        if (liquidityOutResult !== "-1" && valueSp?.data) {
          valueUSD = BN(liquidityOutResult)
            .div(valueDp)
            .times(valueSp.data.spotPrice)
        }

        return { ...acc, [assetId]: valueUSD.plus(acc[assetId] ?? BN_0) }
      },
      {} as { [key: string]: BN },
    )

    const rows = omnipoolAssets.data.map((omnipoolAsset) => {
      const omnipoolAssetId = omnipoolAsset.id.toString()
      const shares = omnipoolAsset.data.shares.toBigNumber()
      const protocolShares = omnipoolAsset.data.protocolShares.toBigNumber()

      const meta = assets.getAsset(omnipoolAssetId)

      const spotPrice = spotPrices.find(
        (sp) => sp?.data?.tokenIn === omnipoolAssetId,
      )?.data?.spotPrice

      const omnipoolAssetBalance = omnipoolAssetBalances.find(
        (b) => b.data?.assetId.toString() === omnipoolAssetId,
      )?.data

      const omnipoolAssetCap = omnipoolAsset.data.cap
        .toBigNumber()
        .div(BN_QUINTILL)

      if (!meta || !spotPrice || !omnipoolAssetBalance) return null

      const free = getFloatingPointAmount(
        omnipoolAssetBalance?.freeBalance ?? BN_0,
        meta.decimals,
      ).times(spotPrice)

      const valueOfShares = protocolShares.div(shares).multipliedBy(free)

      const valueOfLiquidityPositions =
        treasurePositionsValue[omnipoolAssetId] ?? BN_0

      const pol = valueOfLiquidityPositions.plus(valueOfShares)

      const tvl = BN(
        tvls.find((tvl) => tvl.data?.assetId === omnipoolAssetId)?.data
          ?.tvl_usd ?? 0,
      )

      const volume =
        volumes.find((volume) => volume.data?.assetId === omnipoolAssetId)?.data
          ?.volume ?? BN_0

      const iconIds = assets.isStableSwap(meta) ? meta.assets : meta.id

      return {
        id: omnipoolAssetId,
        name: meta.name,
        symbol: meta.symbol,
        tvl,
        volume,
        fee: BN(0),
        pol,
        iconIds,
        cap: omnipoolAssetCap,
        volumePol: BN(0),
      }
    })
    return rows
  }, [
    apiIds.data,
    assets,
    omnipoolAssetBalances,
    omnipoolAssets.data,
    positions,
    spotPrices,
    tvls,
    volumes,
  ])
    .filter(isNotNil)
    .sort((assetA, assetB) => {
      if (assetA.id === NATIVE_ASSET_ID) {
        return -1
      }

      if (assetB.id === NATIVE_ASSET_ID) {
        return 1
      }

      return assetA[sortBy].gt(assetB[sortBy]) ? -1 : 1
    })

  return { data, isLoading }
}

export type TUseOmnipoolAssetDetails = typeof useOmnipoolAssetDetails
export type TUseOmnipoolAssetDetailsData =
  ReturnType<TUseOmnipoolAssetDetails>["data"]
