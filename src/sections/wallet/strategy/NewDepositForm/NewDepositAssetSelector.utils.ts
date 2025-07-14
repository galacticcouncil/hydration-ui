import { useAccountBalances } from "api/deposits"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useMemo } from "react"
import BigNumber from "bignumber.js"
import {
  BN_0,
  DOT_ASSET_ID,
  ETH_ASSET_ID,
  GETH_ERC20_ASSET_ID,
  GETH_STABLESWAP_ASSET_ID,
} from "utils/constants"
import { useStableSwapReserves } from "sections/pools/PoolsPage.utils"
import { useAssetsPrice } from "state/displayPrice"
import { NATIVE_ASSET_ID } from "utils/api"

export const useNewDepositAssets = (
  assetsBlacklist: ReadonlyArray<string>,
): Array<string> => {
  const { account } = useAccount()
  const { data: accountAssets } = useAccountBalances()

  return useMemo(() => {
    return account && accountAssets?.balances
      ? accountAssets.balances
          .map(({ asset }) => asset.id)
          .filter((id) => !assetsBlacklist.includes(id))
      : []
  }, [account, accountAssets?.balances, assetsBlacklist])
}

export const useNewDepositDefaultAssetId = (assetId?: string) => {
  const { account } = useAccount()
  const { data: accountAssets, isInitialLoading } = useAccountBalances()

  const accountBalances = useMemo(
    () => accountAssets?.balances ?? [],
    [accountAssets?.balances],
  )
  const isGETH = assetId && assetId === GETH_ERC20_ASSET_ID

  const { data: gethReserves, isLoading: isLoadingReserves } =
    useStableSwapReserves(isGETH ? GETH_STABLESWAP_ASSET_ID : "")

  const { getAssetPrice, isLoading: isPriceLoading } = useAssetsPrice(
    isGETH ? accountBalances.map(({ asset }) => asset.id) ?? [] : [],
  )

  const data = useMemo(() => {
    if (isGETH) {
      if (!gethReserves || !account || !accountAssets) return DOT_ASSET_ID

      const reserveAccountBalance = gethReserves.balances
        .sort((a, b) => a.percentage - b.percentage)
        .find((reserve) => {
          const balance = accountAssets.accountAssetsMap.get(reserve.id)

          return balance
            ? BigNumber(balance.balance?.transferable ?? 0).gt(0)
            : false
        })

      if (reserveAccountBalance) return reserveAccountBalance.id

      const ethBalance =
        accountAssets.accountAssetsMap.get(ETH_ASSET_ID)?.balance
          ?.transferable ?? "0"

      if (BigNumber(ethBalance).gt(0)) return ETH_ASSET_ID

      const highestBalance = accountBalances
        .map((accountBalance) => {
          const { balance, asset } = accountBalance
          const price = getAssetPrice(asset.id).price

          return {
            ...accountBalance,
            displayBalance: !BigNumber(price).isNaN()
              ? BigNumber(balance.transferable)
                  .shiftedBy(-asset.decimals)
                  .times(price)
              : BN_0,
          }
        })
        .sort((a, b) => {
          if (a.asset.id === NATIVE_ASSET_ID) {
            return 1
          }

          if (b.asset.id === NATIVE_ASSET_ID) {
            return -1
          }

          return a.displayBalance.gt(b.displayBalance) ? -1 : 1
        })
        .find((balance) => {
          return (
            balance.displayBalance.gt(0) &&
            balance.asset.isTradable &&
            !balance.asset.isExternal
          )
        })

      if (highestBalance) return highestBalance.asset.id

      return DOT_ASSET_ID
    } else {
      if (!account || !accountAssets) return DOT_ASSET_ID

      const hasDotBalance = new BigNumber(
        accountAssets.accountAssetsMap.get(DOT_ASSET_ID)?.balance
          ?.transferable || "0",
      ).gt("0")

      if (hasDotBalance) return DOT_ASSET_ID

      const assetWithBalance = accountBalances.find((accountAsset) => {
        const { asset, balance } = accountAsset

        return (
          BigNumber(balance.transferable).gt("0") &&
          asset.isTradable &&
          !asset.isErc20 &&
          !asset.isExternal
        )
      })

      return assetWithBalance?.asset.id ?? DOT_ASSET_ID
    }
  }, [
    account,
    accountAssets,
    accountBalances,
    isGETH,
    gethReserves,
    getAssetPrice,
  ])

  return {
    isLoading: isLoadingReserves || isInitialLoading || isPriceLoading,
    data,
  }
}
