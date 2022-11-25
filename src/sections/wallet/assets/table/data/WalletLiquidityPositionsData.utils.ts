import { useAccountStore } from "state/store"
import { useAccountBalances } from "api/accountBalances"
import { NATIVE_ASSET_ID } from "utils/api"
import { useAssetDetailsList } from "api/assetDetails"
import { useMemo } from "react"
import { usePoolsWithShareTokens, useShareOfPools } from "api/pools"
import BigNumber from "bignumber.js"
import { useUsdPeggedAsset } from "../../../../../api/asset"
import { useSpotPrices } from "../../../../../api/spotPrice"
import { BN_0, BN_1 } from "../../../../../utils/constants"
import { getFloatingPointAmount } from "../../../../../utils/balance"

export const useLiquidityPositionsTableData = () => {
  const { account } = useAccountStore()
  const accountBalances = useAccountBalances(account?.address)

  const tokenIds = accountBalances.data?.balances
    ? [NATIVE_ASSET_ID, ...accountBalances.data.balances.map((b) => b.id)]
    : []

  const assets = useAssetDetailsList(tokenIds, {
    assetType: ["PoolShare"],
  })

  const usd = useUsdPeggedAsset()

  const poolsWithShareTokens = usePoolsWithShareTokens()

  const participatedLiquidityPools = useMemo(() => {
    if (assets.data && poolsWithShareTokens.data) {
      const shareAssetsIds = assets.data.map((asset) => asset.id)
      return poolsWithShareTokens.data
        .filter((pool) => {
          if (pool.shareToken) {
            return shareAssetsIds.includes(pool.shareToken.token.toString())
          }
          return false
        })
        .map((pool) => {
          const shareTokenId = pool.shareToken?.token.toString()
          const name = assets.data.find(
            (shareToken) => shareToken.id === shareTokenId,
          )?.name

          return {
            address: pool.address,
            shareTokenName: name,
            shareTokenId,
            assetA: pool.tokens[0],
            assetB: pool.tokens[1],
          }
        })
    }
    return []
  }, [poolsWithShareTokens.data, assets.data])

  const shares = useShareOfPools(
    participatedLiquidityPools.map((pool) => pool.shareTokenId ?? "") ?? [],
  )

  const queries = [accountBalances, assets, poolsWithShareTokens, shares, usd]
  const isLoading = queries.some((query) => query.isLoading)

  const balances = useMemo(() => {
    if (!!participatedLiquidityPools.length && !!shares.data?.length) {
      return participatedLiquidityPools.map((pool) => {
        const shareAmount = shares.data?.find(
          (share) => share.asset === pool.shareTokenId,
        )
        const assetABalance = new BigNumber(pool.assetA.balance)
        const assetBBalance = new BigNumber(pool.assetB.balance)

        const totalAssetAAmount = getFloatingPointAmount(
          shareAmount?.totalShare?.times(assetABalance).div(100) ?? BN_0,
          pool.assetA.decimals ?? 12,
        )

        const totalAssetBAmount = getFloatingPointAmount(
          shareAmount?.totalShare?.times(assetBBalance).div(100) ?? BN_0,
          pool.assetB.decimals ?? 12,
        )

        const transferableAssetAAmount = getFloatingPointAmount(
          shareAmount?.transferableShare?.times(assetABalance).div(100) ?? BN_0,
          pool.assetA.decimals ?? 12,
        )

        const transferableAssetBAmount = getFloatingPointAmount(
          shareAmount?.transferableShare?.times(assetBBalance).div(100) ?? BN_0,
          pool.assetB.decimals ?? 12,
        )

        return {
          address: pool.address,
          assetA: {
            id: pool.assetA.id,
            total: totalAssetAAmount,
            transferable: transferableAssetAAmount,
          },
          assetB: {
            id: pool.assetB.id,
            total: totalAssetBAmount,
            transferable: transferableAssetBAmount,
          },
        }
      })
    }
    return null
  }, [participatedLiquidityPools, shares])

  const currencies = [
    ...(balances?.map((balance) => balance.assetA.id) ?? []),
    ...(balances?.map((balance) => balance.assetB.id) ?? []),
  ]

  const spotPrices = useSpotPrices(currencies, usd.data?.id)

  const data = useMemo(() => {
    if (participatedLiquidityPools && balances && spotPrices) {
      return participatedLiquidityPools.map((pool) => {
        const amounts = balances.find(
          (balance) => balance.address === pool.address,
        )

        const assetA = amounts?.assetA
        const assetB = amounts?.assetB

        const assetASpotPrice = spotPrices.find(
          (price) => price.data?.tokenIn === pool.assetA.id,
        )?.data?.spotPrice
        const assetBSpotPrice = spotPrices.find(
          (price) => price.data?.tokenIn === pool.assetB.id,
        )?.data?.spotPrice

        const totalAssetAUsd = assetA?.total?.times(assetASpotPrice ?? BN_1)
        const totalAssetBUsd = assetB?.total?.times(assetBSpotPrice ?? BN_1)

        const transferableAssetAUsd = assetA?.transferable?.times(
          assetASpotPrice ?? BN_1,
        )
        const transferableAssetBUsd = assetB?.transferable?.times(
          assetBSpotPrice ?? BN_1,
        )

        return {
          name: pool.shareTokenName,
          poolAddress: pool.address,
          assetA: {
            symbol: pool.assetA.symbol,
            balance: assetA?.total,
            balanceUsd: totalAssetAUsd,
            decimals: pool.assetA.decimals,
            chain: "Basilisk", // TODO: find out proper chain
          },
          assetB: {
            symbol: pool.assetB.symbol,
            balance: assetB?.total,
            balanceUsd: totalAssetBUsd,
            decimals: pool.assetB.decimals,
            chain: "Basilisk", // TODO: find out proper chain
          },
          total: assetA?.total?.plus(assetB?.total ?? BN_0) ?? BN_0,
          totalUsd: totalAssetAUsd?.plus(totalAssetBUsd ?? BN_0) ?? BN_0,
          transferable:
            assetA?.transferable?.plus(assetB?.transferable ?? BN_0) ?? BN_0,
          transferableUsd:
            transferableAssetAUsd?.plus(transferableAssetBUsd ?? BN_0) ?? BN_0,
        }
      })
    }

    return []
  }, [participatedLiquidityPools, balances, spotPrices])

  return { data, isLoading }
}
