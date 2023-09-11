import { u32 } from "@polkadot/types-codec"
import { useAssetDetailsList } from "api/assetDetails"
import { useAssetMetaList } from "api/assetMeta"
import { useTokensBalances } from "api/balances"
import { useApiIds } from "api/consts"
import { useUserDeposits } from "api/deposits"
import { useOmnipoolAssets, useOmnipoolPositions } from "api/omnipool"
import { useUniques } from "api/uniques"
import BN from "bignumber.js"
import { getAssetName } from "components/AssetIcon/AssetIcon"
import { useMemo } from "react"
import { useAssetsTradability } from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import { useAccountStore } from "state/store"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { getFloatingPointAmount } from "utils/balance"
import { BN_0, BN_NAN, TRADING_FEE } from "utils/constants"
import { useDisplayPrices } from "utils/displayAsset"

export const useOmnipoolPools = (withPositions?: boolean) => {
  const { account } = useAccountStore()
  const assets = useOmnipoolAssets()
  const assetDetails = useAssetDetailsList(assets.data?.map((a) => a.id) ?? [])
  const metas = useAssetMetaList(assets.data?.map((a) => a.id) ?? [])
  const apiIds = useApiIds()
  const spotPrices = useDisplayPrices(assets.data?.map((a) => a.id) ?? [])
  const assetsTradability = useAssetsTradability()
  const balances = useTokensBalances(
    assets.data?.map((a) => a.id) ?? [],
    OMNIPOOL_ACCOUNT_ADDRESS,
  )
  const uniques = useUniques(
    account?.address ?? "",
    apiIds.data?.omnipoolCollectionId ?? "",
  )
  const positions = useOmnipoolPositions(
    uniques.data?.map((u) => u.itemId) ?? [],
  )
  const userDeposits = useUserDeposits()

  const queries = [
    assets,
    assetDetails,
    metas,
    apiIds,
    uniques,
    assetsTradability,
    userDeposits,
    spotPrices,
    ...positions,
    ...balances,
  ]
  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const pools = useMemo(() => {
    if (
      !assets.data ||
      !assetDetails.data ||
      !metas.data ||
      !apiIds.data ||
      !assetsTradability.data ||
      !spotPrices.data ||
      balances.some((q) => !q.data) ||
      positions.some((q) => !q.data)
    )
      return undefined

    const rows: OmnipoolPool[] = assets.data
      .map((asset) => {
        const details = assetDetails.data.find(
          (d) => d.id.toString() === asset.id.toString(),
        )
        const meta = metas.data?.find(
          (m) => m.id.toString() === asset.id.toString(),
        )
        const spotPrice = spotPrices.data?.find(
          (sp) => sp?.tokenIn === asset.id.toString(),
        )?.spotPrice
        const balance = balances.find(
          (b) => b.data?.assetId.toString() === asset.id.toString(),
        )?.data?.balance
        const tradabilityData = assetsTradability.data?.find(
          (t) => t.id === asset.id.toString(),
        )
        const tradability = {
          canBuy: !!tradabilityData?.canBuy,
          canSell: !!tradabilityData?.canSell,
          canAddLiquidity: !!tradabilityData?.canAddLiquidity,
          canRemoveLiquidity: !!tradabilityData?.canRemoveLiquidity,
        }

        const id = asset.id
        const symbol = meta?.symbol ?? "N/A"
        const name = details?.name || getAssetName(meta?.symbol)
        const tradeFee = TRADING_FEE

        const total = getFloatingPointAmount(
          balance ?? BN_0,
          meta?.decimals?.toNumber() ?? 12,
        )
        const totalDisplay = !spotPrice ? BN_NAN : total.times(spotPrice)

        const hasPositions = positions.some(
          (p) => p.data?.assetId.toString() === id.toString(),
        )
        const hasDeposits = userDeposits.data?.some(
          (deposit) => deposit.deposit.ammPoolId.toString() === id.toString(),
        )

        return {
          id,
          symbol,
          name,
          tradeFee,
          total,
          totalDisplay,
          tradability,
          hasPositions,
          hasDeposits,
        }
      })
      .filter((x): x is OmnipoolPool => x !== null)

    return rows
  }, [
    assets.data,
    assetDetails.data,
    metas.data,
    apiIds.data,
    spotPrices,
    balances,
    positions,
    assetsTradability.data,
    userDeposits.data,
  ])

  const data = useMemo(
    () =>
      withPositions
        ? pools?.filter((pool) => pool.hasPositions || pool.hasDeposits)
        : pools,
    [pools, withPositions],
  )

  const hasPositionsOrDeposits = useMemo(
    () => pools?.some((pool) => pool.hasPositions || pool.hasDeposits),
    [pools],
  )

  data?.sort((poolA, poolB) => {
    if (poolA.name === "HDX") {
      return -1
    }

    if (poolB.name === "HDX") {
      return 1
    }

    return poolA.totalDisplay.gt(poolB.totalDisplay) ? -1 : 1
  })

  return { data, hasPositionsOrDeposits, isLoading: isInitialLoading }
}

export type OmnipoolPool = {
  id: u32
  symbol: string
  name: string
  tradeFee: BN
  total: BN
  totalDisplay: BN
  tradability: {
    canSell: boolean
    canBuy: boolean
    canAddLiquidity: boolean
    canRemoveLiquidity: boolean
  }
  hasPositions: boolean
  hasDeposits: boolean
}
