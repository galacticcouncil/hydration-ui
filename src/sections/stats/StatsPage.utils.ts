import { useOmnipoolDataObserver } from "api/omnipool"
import BN from "bignumber.js"
import { useMemo } from "react"
import { HYDRA_TREASURE_ACCOUNT } from "utils/api"
import { scaleHuman } from "utils/balance"
import { BN_0, BN_NAN } from "utils/constants"
import { useNewDisplayPrices } from "utils/displayAsset"
import { useFee, useTVL } from "api/stats"
import { useOmnipoolVolumes } from "api/volume"
import { useLiquidityPositionData } from "utils/omnipool"
import { useAssets } from "providers/assets"
import { useAccountAssets } from "api/deposits"
import { useOmnipoolFarms } from "api/farms"

const withoutRefresh = true

export const useOmnipoolAssetDetails = (sortBy: "tvl" | "pol") => {
  const { native, getAssetWithFallback } = useAssets()
  const { data: accountAssets, isLoading: isAccountAssetsLoading } =
    useAccountAssets(HYDRA_TREASURE_ACCOUNT)
  const omnipoolAssets = useOmnipoolDataObserver()
  const { getData } = useLiquidityPositionData()

  //const { data: treasuryBalances } = useTreasuryBalances()

  const omnipoolAssetsIds = omnipoolAssets.data?.map((a) => a.id) ?? []
  const { data: allFarms, isLoading: isAllFarmsLoading } =
    useOmnipoolFarms(omnipoolAssetsIds)

  const { data: volumes = [], isLoading: isVolumeLoading } =
    useOmnipoolVolumes(omnipoolAssetsIds)

  const { data: tvls, isLoading: isTvlsLoading } = useTVL("all")
  const { data: fees, isLoading: isFeesLoading } = useFee("all")

  const { data: spotPrices, isLoading: isSpotPricesLoading } =
    useNewDisplayPrices(omnipoolAssetsIds, withoutRefresh)

  const isLoading =
    omnipoolAssets.isLoading ||
    isSpotPricesLoading ||
    isAccountAssetsLoading ||
    isTvlsLoading

  const positions = accountAssets?.liquidityPositions

  // const treasuryDollarBalance = useMemo(() => {
  //   if (treasuryBalances && spotPrices) {
  //     const spotPrice =
  //       spotPrices.find((sp) => sp?.tokenIn === treasuryBalances.id)
  //         ?.spotPrice ?? ""

  //     const meta = getAssetWithFallback(treasuryBalances.id)

  //     return BigNumber(treasuryBalances.balance)
  //       .shiftedBy(-meta.decimals)
  //       .times(spotPrice)
  //       .decimalPlaces(4)
  //       .toString()
  //   }
  // }, [getAssetWithFallback, spotPrices, treasuryBalances])

  const data = useMemo(() => {
    if (!omnipoolAssets.data || !tvls || !spotPrices || !positions) return []

    // get a price of each position of HYDRA_TREASURE_ACCOUNT and filter it
    const treasurePositionsValue = positions.reduce(
      (acc, position) => {
        const data = getData(position)

        const assetId = position.assetId

        return {
          ...acc,
          [assetId]: data?.valueDisplay.plus(acc[assetId] ?? BN_0) ?? BN_NAN,
        }
      },
      {} as { [key: string]: BN },
    )

    const rows = omnipoolAssets.data.map((omnipoolAsset) => {
      const omnipoolAssetId = omnipoolAsset.id
      const shares = omnipoolAsset.shares
      const protocolShares = BN(omnipoolAsset.protocolShares)

      const meta = getAssetWithFallback(omnipoolAsset.id)

      const spotPrice =
        spotPrices.find((sp) => sp?.tokenIn === omnipoolAssetId)?.spotPrice ??
        ""

      const omnipoolAssetCap = scaleHuman(omnipoolAsset.cap, "q")

      const free = omnipoolAsset.balance

      const valueOfShares = protocolShares
        .div(shares)
        .multipliedBy(free)
        .shiftedBy(-meta.decimals)
        .times(spotPrice)

      console.log({
        id: meta.id,
        symbol: meta.symbol,
        amount: protocolShares
          .div(shares)
          .multipliedBy(omnipoolAsset.balance)
          .toString(),
        amountHuman: protocolShares
          .div(shares)
          .multipliedBy(omnipoolAsset.balance)
          .shiftedBy(-meta.decimals)
          .toString(),
        dollar: valueOfShares.toString(),
      })

      const valueOfLiquidityPositions =
        treasurePositionsValue[omnipoolAssetId] ?? BN_0

      const pol = valueOfLiquidityPositions.plus(valueOfShares)

      const tvl = BN(
        tvls?.find((tvl) => tvl?.asset_id === Number(omnipoolAssetId))
          ?.tvl_usd ?? BN_NAN,
      )

      const volumeRaw = volumes?.find(
        (volume) => volume.assetId === meta.id,
      )?.assetVolume

      const volume =
        volumeRaw && spotPrice
          ? BN(volumeRaw).shiftedBy(-meta.decimals).multipliedBy(spotPrice)
          : BN_NAN
      const isLoadingFee = isFeesLoading || isAllFarmsLoading

      const { totalApr, farms = [] } = allFarms?.get(omnipoolAsset.id) ?? {}

      const fee =
        native.id === omnipoolAssetId
          ? BN_0
          : BN(
              fees?.find((fee) => fee?.asset_id === Number(omnipoolAssetId))
                ?.projected_apr_perc ?? BN_NAN,
            )

      const totalFee = !isLoadingFee ? fee.plus(totalApr ?? 0) : BN_NAN

      return {
        id: omnipoolAssetId,
        name: meta.name,
        symbol: meta.symbol,
        tvl,
        volume,
        pol,
        iconIds: meta.iconId,
        cap: omnipoolAssetCap,
        volumePol: BN(0),
        price: spotPrice,
        fee,
        totalFee,
        farms,
        isLoadingFee,
        isLoadingVolume: isVolumeLoading,
      }
    })
    return rows
  }, [
    fees,
    isFeesLoading,
    getAssetWithFallback,
    getData,
    native.id,
    omnipoolAssets.data,
    positions,
    spotPrices,
    tvls,
    volumes,
    isVolumeLoading,
    allFarms,
    isAllFarmsLoading,
  ]).sort((assetA, assetB) => {
    if (assetA.id === native.id) {
      return -1
    }

    if (assetB.id === native.id) {
      return 1
    }

    if (assetA[sortBy].isNaN()) return 1
    if (assetB[sortBy].isNaN()) return -1

    return assetA[sortBy].gt(assetB[sortBy]) ? -1 : 1
  })

  return { data, isLoading }
}

export type TUseOmnipoolAssetDetailsData = ReturnType<
  typeof useOmnipoolAssetDetails
>["data"]
