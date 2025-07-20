import { useMemo } from "react"
import { arraySearch } from "utils/helpers"
import { TLPData, useLiquidityPositionData } from "utils/omnipool"
import { useDisplayShareTokenPrice } from "utils/displayAsset"
import { BN_NAN } from "utils/constants"
import { useAssets } from "providers/assets"
import { useAccountBalances, useAccountPositions } from "api/deposits"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useTotalIssuances } from "api/totalIssuance"
import BigNumber from "bignumber.js"
import { useXYKSDKPools } from "api/xyk"

export const useOmnipoolPositionsData = ({
  search,
  address,
}: { search?: string; address?: string } = {}) => {
  const { data: accountPositions, isInitialLoading } =
    useAccountPositions(address)
  const { liquidityPositions } = accountPositions ?? {}

  const positionIds = liquidityPositions?.map((position) => position.assetId)

  const { getData } = useLiquidityPositionData(positionIds)

  const data = useMemo(() => {
    const rows = (liquidityPositions ?? []).reduce<TLPData[]>(
      (acc, position) => {
        const data = getData(position)
        if (data) acc.push(data)
        return acc
      },
      [],
    )

    return search ? arraySearch(rows, search, ["symbol", "name"]) : rows
  }, [getData, liquidityPositions, search])

  return {
    data,
    isLoading: isInitialLoading,
    isInitialLoading,
  }
}

export const useXykPositionsData = ({ search }: { search?: string } = {}) => {
  const { isShareToken } = useAssets()
  const { account } = useAccount()
  const { data: accountAssets } = useAccountBalances(account?.address)

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

  const { data: xykPools, isLoading: isXykPoolsLoading } = useXYKSDKPools()
  const { data: totalIssuances, isLoading: isIssuancesLoading } =
    useTotalIssuances()
  const spotPrices = useDisplayShareTokenPrice(shareTokensId)

  const isLoading =
    isIssuancesLoading || isXykPoolsLoading || spotPrices.isInitialLoading

  const data = useMemo(() => {
    if (!accountShareTokens.length || !totalIssuances || !xykPools) return []

    const rows = accountShareTokens.map((myPool) => {
      const totalIssuance = totalIssuances.get(myPool.asset.id)

      const poolTokens = xykPools.find(
        (xykPool) => xykPool.address === myPool.asset.poolAddress,
      )?.tokens

      const balances = myPool.asset.assets.map((asset) => {
        const balance = poolTokens?.find(
          (token) => token.id === asset.id,
        )?.balance

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
  }, [accountShareTokens, search, spotPrices.data, totalIssuances, xykPools])

  return { data, isLoading }
}

export type TXYKPosition = NonNullable<
  ReturnType<typeof useXykPositionsData>["data"]
>[number]

export const isXYKPosition = (
  position: TLPData | TXYKPosition,
): position is TXYKPosition => (position as TXYKPosition).isXykPosition
