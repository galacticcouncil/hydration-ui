import { useOmnipoolPositions } from "api/omnipool"
import { useMemo } from "react"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { arraySearch, isNotNil } from "utils/helpers"
import { useRpcProvider } from "providers/rpcProvider"
import { useLiquidityPositionData } from "utils/omnipool"
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

  const { getData } = useLiquidityPositionData(positionIds)

  const isLoading = positions.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (positions.some((q) => !q.data)) return []

    const rows: HydraPositionsTableData[] = positions
      .map((query) => {
        const position = query.data
        if (!position) return null

        const assetId = position.assetId.toString()
        const { symbol, name } = assets.getAsset(assetId)

        const data = getData(position)

        return {
          id: position.id.toString(),
          assetId,
          symbol,
          name,
          ...data,
        }
      })
      .filter((x): x is HydraPositionsTableData => x !== null)

    return search ? arraySearch(rows, search, ["symbol", "name"]) : rows
  }, [assets, getData, positions, search])

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

        const myShare = myPool.balance.total.div(totalIssuance ?? 1)

        const balanceHuman =
          balance?.shiftedBy(-balanceMeta.decimals).multipliedBy(myShare) ??
          BN_NAN

        return { amount: balanceHuman, symbol: balanceMeta.symbol }
      })

      const spotPrice = spotPrices.data.find(
        (spotPrice) => spotPrice.tokenIn === meta.id,
      )

      const amount =
        totalIssuance
          ?.times(myPool.balance.total.div(totalIssuance ?? 1))
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
