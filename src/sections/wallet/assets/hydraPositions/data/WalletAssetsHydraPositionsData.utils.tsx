import { useTokensBalances } from "api/balances"
import { useOmnipoolAssets, useOmnipoolPositions } from "api/omnipool"
import BN from "bignumber.js"
import { useMemo } from "react"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { useDisplayPrices } from "utils/displayAsset"
import { arraySearch, isNotNil } from "utils/helpers"
import { useRpcProvider } from "providers/rpcProvider"
import { calculatePositionLiquidity } from "utils/omnipool"
import { useShareTokens } from "api/xyk"
import { useAccountsBalances } from "api/accountBalances"
import { useShareOfPools } from "api/pools"
import { useDisplayShareTokenPrice } from "utils/displayAsset"
import { BN_NAN } from "utils/constants"
import { TShareToken } from "api/assetDetails"
import { useAccountNFTPositions } from "api/deposits"

export const useOmnipoolPositionsData = ({
  search,
  address,
}: { search?: string; address?: string } = {}) => {
  const { assets } = useRpcProvider()
  const accountPositions = useAccountNFTPositions(address)
  const positions = useOmnipoolPositions(
    accountPositions.data?.omnipoolNfts.map((nft) => nft.instanceId) ?? [],
  )

  const positionIds =
    positions
      .map((position) => position.data?.assetId.toString())
      .filter(isNotNil) ?? []

  const omnipoolAssets = useOmnipoolAssets()
  const omnipoolBalances = useTokensBalances(
    positionIds,
    OMNIPOOL_ACCOUNT_ADDRESS,
  )
  const spotPrices = useDisplayPrices([assets.hub.id, ...positionIds])

  const queries = [
    omnipoolAssets,
    spotPrices,
    ...positions,
    ...omnipoolBalances,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (
      !omnipoolAssets.data ||
      !spotPrices.data ||
      positions.some((q) => !q.data) ||
      omnipoolBalances.some((q) => !q.data)
    )
      return []

    const rows: HydraPositionsTableData[] = positions
      .map((query) => {
        const position = query.data
        if (!position) return null

        const assetId = position.assetId.toString()
        const meta = assets.getAsset(assetId)
        const lrnaMeta = assets.hub
        const omnipoolAsset = omnipoolAssets.data.find(
          (a) => a.id.toString() === assetId,
        )
        const omnipoolBalance = omnipoolBalances.find(
          (b) => b.data?.assetId.toString() === assetId,
        )

        const symbol = meta.symbol
        const name = meta.name

        const lrnaSp = spotPrices.data?.find(
          (sp) => sp?.tokenIn === lrnaMeta.id,
        )

        const valueSp = spotPrices.data?.find((sp) => sp?.tokenIn === assetId)

        const liquidityValues = calculatePositionLiquidity({
          position,
          omnipoolBalance: omnipoolBalance?.data?.balance ?? BN(0),
          omnipoolHubReserve: omnipoolAsset?.data.hubReserve,
          omnipoolShares: omnipoolAsset?.data.shares,
          lrnaSpotPrice: lrnaSp?.spotPrice ?? BN(0),
          valueSpotPrice: valueSp?.spotPrice ?? BN(0),
          lrnaDecimals: lrnaMeta.decimals,
          assetDecimals: meta.decimals,
        })

        const result = {
          id: position.id.toString(),
          assetId,
          symbol,
          name,
          ...liquidityValues,
        }

        return result
      })
      .filter((x): x is HydraPositionsTableData => x !== null)

    return search ? arraySearch(rows, search, ["symbol", "name"]) : rows
  }, [
    omnipoolAssets.data,
    spotPrices.data,
    positions,
    omnipoolBalances,
    search,
    assets,
  ])

  return {
    data,
    isLoading,
    isInitialLoading: isLoading,
  }
}

export const useXykPositionsData = ({ search }: { search?: string } = {}) => {
  const { assets } = useRpcProvider()
  const shareTokens = useShareTokens()

  const shareTokensId =
    shareTokens.data?.map((shareToken) => shareToken.shareTokenId) ?? []

  const totalIssuances = useShareOfPools(shareTokensId)

  const myShareTokens = useMemo(
    () =>
      totalIssuances.data?.filter(
        (totalIssuance) => totalIssuance.myPoolShare?.gt(0),
      ) ?? [],
    [totalIssuances.data],
  )

  const myPools = useMemo(
    () =>
      shareTokens.data?.filter((pool) =>
        myShareTokens.some(
          (myShareToken) => myShareToken.asset === pool.shareTokenId,
        ),
      ) ?? [],
    [myShareTokens, shareTokens.data],
  )

  const poolBalances = useAccountsBalances(
    myPools?.map((myPool) => myPool.poolAddress) ?? [],
  )

  const spotPrices = useDisplayShareTokenPrice(
    myPools?.map((myPool) => myPool.shareTokenId) ?? [],
  )

  const isLoading =
    shareTokens.isInitialLoading ||
    totalIssuances.isInitialLoading ||
    poolBalances.isInitialLoading ||
    spotPrices.isInitialLoading

  const data = useMemo(() => {
    if (!myPools.length || !totalIssuances.data || !poolBalances.data) return []

    const rows = myPools.map((myPool) => {
      const meta = assets.getAsset(myPool.shareTokenId) as TShareToken

      const totalIssuance = totalIssuances.data?.find(
        (totalIssuance) => totalIssuance.asset === myPool.shareTokenId,
      )

      const poolBalance = poolBalances.data?.find(
        (poolBalance) =>
          poolBalance.accountId.toString() === myPool.poolAddress,
      )

      const balances =
        poolBalance?.balances.map((balance) => {
          const balanceMeta = assets.getAsset(balance.id.toString())

          const balanceHuman = balance.freeBalance
            .shiftedBy(-balanceMeta.decimals)
            .multipliedBy(totalIssuance?.myPoolShare ?? 1)
            .div(100)

          return { amount: balanceHuman, symbol: balanceMeta.symbol }
        }) ?? []

      if (meta.assets.includes(assets.native.id)) {
        const balanceHuman =
          poolBalance?.native.freeBalance
            .shiftedBy(-assets.native.decimals)
            .multipliedBy(totalIssuance?.myPoolShare ?? 1)
            .div(100) ?? BN_NAN

        // order of the HDX in a share token pair
        if (meta.assets[0] === assets.native.id) {
          balances.unshift({
            amount: balanceHuman,
            symbol: assets.native.symbol,
          })
        } else {
          balances.push({ amount: balanceHuman, symbol: assets.native.symbol })
        }
      }

      const spotPrice = spotPrices.data.find(
        (spotPrice) => spotPrice.tokenIn === myPool.shareTokenId,
      )

      const amount =
        totalIssuance?.totalShare
          ?.multipliedBy(totalIssuance.myPoolShare ?? 1)
          .div(100)
          .shiftedBy(-meta.decimals) ?? BN_NAN

      const valueDisplay = amount.multipliedBy(spotPrice?.spotPrice ?? 1)

      return {
        amount,
        valueDisplay,
        value: BN_NAN,
        id: meta.id,
        assetId: meta.id,
        name: meta.name,
        symbol: meta.symbol,
        balances,
        isXykPosition: true,
      }
    })

    return search ? arraySearch(rows, search, ["symbol", "name"]) : rows
  }, [
    assets,
    myPools,
    poolBalances.data,
    search,
    spotPrices.data,
    totalIssuances.data,
  ])

  return { data, isLoading }
}

export type TXYKPosition = NonNullable<
  ReturnType<typeof useXykPositionsData>["data"]
>[number]

export const isXYKPosition = (
  position: HydraPositionsTableData | TXYKPosition,
): position is TXYKPosition => (position as TXYKPosition).isXykPosition
