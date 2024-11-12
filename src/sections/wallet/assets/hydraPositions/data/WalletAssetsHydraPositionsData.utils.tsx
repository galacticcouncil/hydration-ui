import { useMemo } from "react"
import { arraySearch } from "utils/helpers"
import { TLPData, useLiquidityPositionData } from "utils/omnipool"
import { useAccountsBalances } from "api/accountBalances"
import { useDisplayShareTokenPrice } from "utils/displayAsset"
import { BN_NAN } from "utils/constants"
import { useAssets } from "providers/assets"
import { useAccountAssets } from "api/deposits"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useTotalIssuances } from "api/totalIssuance"
import BigNumber from "bignumber.js"

export const useOmnipoolPositionsData = ({
  search,
  address,
}: { search?: string; address?: string } = {}) => {
  const accountPositionsQuery = useAccountAssets(address)
  const positions = useMemo(
    () => accountPositionsQuery.data?.liquidityPositions ?? [],
    [accountPositionsQuery.data?.liquidityPositions],
  )

  const positionIds = positions.map((position) => position.assetId)

  const { getData } = useLiquidityPositionData(positionIds)

  const isLoading = accountPositionsQuery.isInitialLoading

  const data = useMemo(() => {
    const rows = positions.reduce<TLPData[]>((acc, position) => {
      const data = getData(position)
      if (data) acc.push(data)
      return acc
    }, [])

    return search ? arraySearch(rows, search, ["symbol", "name"]) : rows
  }, [getData, positions, search])

  return {
    data,
    isLoading,
    isInitialLoading: isLoading,
  }
}

export const useXykPositionsData = ({ search }: { search?: string } = {}) => {
  const { native, isShareToken } = useAssets()
  const { account } = useAccount()
  const { data: accountAssets } = useAccountAssets(account?.address)

  const accountShareTokens = useMemo(() => {
    const accountShareTokens = []
    if (accountAssets) {
      for (const [, accountAsset] of accountAssets.accountAssetsMap) {
        if (accountAsset.balance && isShareToken(accountAsset.asset)) {
          accountShareTokens.push({
            asset: accountAsset.asset,
            balance: accountAsset.balance,
          })
        }
      }
    }

    return accountShareTokens
  }, [accountAssets, isShareToken])

  const shareTokensId = accountShareTokens.map((pool) => pool.asset.id)
  const shareTokensAddresses = accountShareTokens.map(
    (pool) => pool.asset.poolAddress,
  )

  const totalIssuances = useTotalIssuances()
  const poolBalances = useAccountsBalances(shareTokensAddresses)
  const spotPrices = useDisplayShareTokenPrice(shareTokensId)

  const isLoading =
    totalIssuances.isInitialLoading ||
    poolBalances.isInitialLoading ||
    spotPrices.isInitialLoading

  const data = useMemo(() => {
    if (
      !accountShareTokens.length ||
      !totalIssuances.data ||
      !poolBalances.data
    )
      return []

    const rows = accountShareTokens.map((myPool) => {
      const totalIssuance = totalIssuances.data.get(myPool.asset.id)

      const poolBalance = poolBalances.data?.find(
        (poolBalance) =>
          poolBalance.accountId.toString() === myPool.asset.poolAddress,
      )
      const balances = myPool.asset.assets.map((asset) => {
        const balance =
          asset.id === native.id
            ? poolBalance?.native.freeBalance
            : poolBalance?.balances.find(
                (balance) => balance.assetId === asset.id,
              )?.freeBalance

        const myShare = BigNumber(myPool.balance.total).div(totalIssuance ?? 1)

        const balanceHuman = balance
          ? BigNumber(balance).shiftedBy(-asset.decimals).multipliedBy(myShare)
          : BN_NAN

        return { amount: balanceHuman, symbol: asset.symbol }
      })

      const spotPrice = spotPrices.data.find(
        (spotPrice) => spotPrice.tokenIn === myPool.asset.id,
      )

      const amount =
        totalIssuance
          ?.times(BigNumber(myPool.balance.total).div(totalIssuance ?? 1))
          .shiftedBy(-myPool.asset.decimals) ?? BN_NAN

      const valueDisplay = amount.multipliedBy(spotPrice?.spotPrice ?? 1)

      return {
        amount,
        valueDisplay,
        value: BN_NAN,
        id: myPool.asset.id,
        assetId: myPool.asset.id,
        name: myPool.asset.name,
        symbol: myPool.asset.symbol,
        balances,
        isXykPosition: true,
      }
    })

    return search ? arraySearch(rows, search, ["symbol", "name"]) : rows
  }, [
    accountShareTokens,
    native.id,
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
  position: TLPData | TXYKPosition,
): position is TXYKPosition => (position as TXYKPosition).isXykPosition
