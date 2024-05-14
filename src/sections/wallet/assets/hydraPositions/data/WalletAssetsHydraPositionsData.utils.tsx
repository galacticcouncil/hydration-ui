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
import { useAccountsBalances } from "api/accountBalances"
import { useDisplayShareTokenPrice } from "utils/displayAsset"
import { BN_NAN } from "utils/constants"
import { TShareToken, useAcountAssets } from "api/assetDetails"
import { useAccountNFTPositions } from "api/deposits"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useTotalIssuances } from "api/totalIssuance"

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
  const { account } = useAccount()
  const accountBalances = useAcountAssets(account?.address)

  const accountShareTokens = accountBalances.filter((accountBalance) =>
    assets.isShareToken(accountBalance.asset),
  )

  const shareTokensId = accountShareTokens?.map((pool) => pool.asset.id) ?? []

  const totalIssuances = useTotalIssuances(shareTokensId)

  const poolBalances = useAccountsBalances(
    accountShareTokens?.map(
      (pool) => (pool.asset as TShareToken).poolAddress,
    ) ?? [],
  )

  const spotPrices = useDisplayShareTokenPrice(shareTokensId)

  const isLoading =
    totalIssuances.some((totalIssuance) => totalIssuance.isInitialLoading) ||
    poolBalances.isInitialLoading ||
    spotPrices.isInitialLoading

  const data = useMemo(() => {
    if (!accountShareTokens.length || !totalIssuances || !poolBalances.data)
      return []

    const rows = accountShareTokens.map((myPool) => {
      const meta = assets.getAsset(myPool.asset.id) as TShareToken

      const totalIssuance = totalIssuances.find(
        (totalIssuance) => totalIssuance.data?.token === meta.id,
      )?.data?.total

      const poolBalance = poolBalances.data?.find(
        (poolBalance) => poolBalance.accountId.toString() === meta.poolAddress,
      )
      const balances = meta.assets.map((assetId) => {
        const balanceMeta = assets.getAsset(assetId)
        const balance =
          assetId === assets.native.id
            ? poolBalance?.native.freeBalance
            : poolBalance?.balances.find((balance) => balance.id === assetId)
                ?.freeBalance

        const myShare = myPool.balance.total.div(totalIssuance ?? 1).times(100)

        const balanceHuman = balance
          ?.shiftedBy(-balanceMeta.decimals)
          .multipliedBy(myShare)
          .div(100)

        return { amount: balanceHuman, symbol: balanceMeta.symbol }
      })

      const spotPrice = spotPrices.data.find(
        (spotPrice) => spotPrice.tokenIn === meta.id,
      )
      console.log(spotPrice, "spotPrice")
      const amount =
        totalIssuance
          ?.div(myPool.balance.balance ?? 1)
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
    accountShareTokens,
    assets,
    poolBalances.data,
    search,
    spotPrices.data,
    totalIssuances,
  ])

  return { data, isLoading }
}

export type TXYKPosition = NonNullable<
  ReturnType<typeof useXykPositionsData>["data"]
>[number]

export const isXYKPosition = (
  position: HydraPositionsTableData | TXYKPosition,
): position is TXYKPosition => (position as TXYKPosition).isXykPosition
