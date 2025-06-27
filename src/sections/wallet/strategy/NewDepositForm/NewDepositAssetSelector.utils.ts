import { useAccountAssets } from "api/deposits"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { prop } from "utils/rx"
import { useMemo } from "react"
import BigNumber from "bignumber.js"
import {
  DOT_ASSET_ID,
  ETH_ASSET_ID,
  GETH_ERC20_ASSET_ID,
  GETH_STABLESWAP_ASSET_ID,
} from "utils/constants"
import { useAssets } from "providers/assets"
import { useStableSwapReserves } from "sections/pools/PoolsPage.utils"
import { useAssetsPrice } from "state/displayPrice"

export const useNewDepositAssets = (
  assetsBlacklist: ReadonlyArray<string>,
): Array<string> => {
  const { account } = useAccount()
  const { data: accountAssets } = useAccountAssets()

  return useMemo(() => {
    return account && accountAssets?.balances
      ? accountAssets.balances
          .map(prop("assetId"))
          .filter((id) => !assetsBlacklist.includes(id))
      : []
  }, [account, accountAssets?.balances, assetsBlacklist])
}

export const useNewDepositDefaultAssetId = (assetId?: string) => {
  const { account } = useAccount()
  const { data: accountAssets, isInitialLoading } = useAccountAssets()
  const { getAssetWithFallback } = useAssets()

  const accountBalances = useMemo(
    () => accountAssets?.balances ?? [],
    [accountAssets?.balances],
  )
  const isGETH = assetId && assetId === GETH_ERC20_ASSET_ID

  const { data: gethReserves, isLoading: isLoadingReserves } =
    useStableSwapReserves(isGETH ? GETH_STABLESWAP_ASSET_ID : "")

  const { getAssetPrice, isLoading: isPriceLoading } = useAssetsPrice(
    isGETH ? accountBalances.map(prop("assetId")) ?? [] : [],
  )

  const data = useMemo(() => {
    if (isGETH) {
      if (!gethReserves || !account || !accountAssets) return DOT_ASSET_ID

      const reserveAccountBalance = gethReserves.balances
        .sort((a, b) => a.percentage - b.percentage)
        .find((reserve) => {
          const balance = accountAssets.accountAssetsMap.get(reserve.id)

          return balance
            ? BigNumber(balance.balance?.freeBalance ?? 0).gt(0)
            : false
        })

      if (reserveAccountBalance) return reserveAccountBalance.id

      const ethBalance =
        accountAssets.accountAssetsMap.get(ETH_ASSET_ID)?.balance
          ?.freeBalance ?? "0"

      if (BigNumber(ethBalance).gt(0)) return ETH_ASSET_ID

      const highestBalance = accountBalances
        .map((accountBalance) => {
          const price = getAssetPrice(accountBalance.assetId).price
          const meta = getAssetWithFallback(accountBalance.assetId)

          return {
            ...accountBalance,
            meta,
            displayBalance: BigNumber(accountBalance.freeBalance)
              .shiftedBy(-meta.decimals)
              .times(price),
          }
        })
        .sort((a, b) => (a.displayBalance.gt(b.displayBalance) ? -1 : 1))
        .find((balance) => {
          return (
            balance.displayBalance.gt(0) &&
            balance.meta.isTradable &&
            !balance.meta.isExternal
          )
        })

      if (highestBalance) return highestBalance.assetId

      return DOT_ASSET_ID
    } else {
      if (!account || !accountAssets) return DOT_ASSET_ID

      const hasDotBalance = new BigNumber(
        accountAssets.accountAssetsMap.get(DOT_ASSET_ID)?.balance
          ?.freeBalance || "0",
      ).gt("0")

      if (hasDotBalance) return DOT_ASSET_ID

      const assetWithBalance = accountBalances.find((accountAsset) => {
        const asset = getAssetWithFallback(accountAsset.assetId)

        return (
          BigNumber(accountAsset.balance).gt("0") &&
          asset.isTradable &&
          !asset.isErc20 &&
          !asset.isExternal
        )
      })

      return assetWithBalance?.assetId ?? DOT_ASSET_ID
    }
  }, [
    account,
    accountAssets,
    accountBalances,
    isGETH,
    gethReserves,
    getAssetWithFallback,
    getAssetPrice,
  ])

  return {
    isLoading: isLoadingReserves || isInitialLoading || isPriceLoading,
    data,
  }
}
