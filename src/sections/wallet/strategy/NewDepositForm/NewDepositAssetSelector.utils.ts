import { useAccountBalances } from "api/deposits"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useMemo } from "react"
import BigNumber from "bignumber.js"
import { BN_0, DOT_ASSET_ID } from "utils/constants"
import { useStableSwapReserves } from "sections/pools/PoolsPage.utils"
import { useAssetsPrice } from "state/displayPrice"
import { NATIVE_ASSET_ID } from "utils/api"
import { useAssets } from "providers/assets"
import { useAssetsData } from "sections/assets/AssetsModal.utils"
import { identity, isNotNil, sortAssets } from "utils/helpers"
import { uniqBy } from "utils/rx"

type UseNewDepositAssetsOptions = {
  firstAssetId?: string
  blacklist?: string[]
  lowPriorityAssetIds?: string[]
  underlyingAssetsFirst?: boolean
}

export const useNewDepositAssets = (
  assetId: string,
  options: UseNewDepositAssetsOptions = {},
): Array<string> => {
  const { firstAssetId, underlyingAssetsFirst = false } = options

  const blacklist = useMemo(
    () => options?.blacklist ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.blacklist?.join(",")],
  )

  const lowPriorityAssetIds = useMemo(
    () => options?.lowPriorityAssetIds ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.lowPriorityAssetIds?.join(",")],
  )

  const { data } = useAccountBalances()
  const { accountAssetsMap } = data ?? {}
  const { getAsset, getErc20, tradable } = useAssets()

  const asset = getAsset(assetId)

  const assets = useMemo(() => {
    return tradable
      .map((asset) => asset.id)
      .filter((id) => !blacklist.includes(id))
  }, [blacklist, tradable])

  const { tokens } = useAssetsData({
    allowedAssets: assets,
    displayZeroBalance: true,
  })

  return useMemo(() => {
    const underlyingAssetsIds = Object.keys(asset?.meta ?? {}).flatMap(
      (assetId) => {
        const assets = [assetId]

        const erc20 = getErc20(assetId)
        // If the asset is an aToken, we also want to include its underlying asset
        if (erc20?.underlyingAssetId) {
          assets.push(erc20.underlyingAssetId)
        }

        return assets
      },
    )

    const underlyingAssets = underlyingAssetsIds
      .map((id) => {
        const meta = getAsset(id)
        const balance = accountAssetsMap?.get(id)?.balance.transferable
        if (!meta || !balance) return null
        return {
          meta,
          displayValue: balance,
        }
      })
      .filter(isNotNil)

    const sortedAssets = sortAssets(
      [...underlyingAssets, ...tokens.allowed],
      "displayValue",
      {
        firstAssetId,
        lowPriorityAssetIds,
      },
    )

    const sortedAssetsIds = sortedAssets.map((asset) => asset.meta.id)

    const ids = underlyingAssetsFirst
      ? [firstAssetId, ...underlyingAssetsIds, ...sortedAssetsIds].filter(
          isNotNil,
        )
      : sortedAssetsIds

    return uniqBy(identity, ids)
  }, [
    accountAssetsMap,
    asset?.meta,
    firstAssetId,
    getAsset,
    getErc20,
    lowPriorityAssetIds,
    tokens.allowed,
    underlyingAssetsFirst,
  ])
}

export const useNewDepositDefaultAssetId = (assetId?: string) => {
  const { account } = useAccount()
  const { getRelatedAToken, getErc20, getAssetWithFallback } = useAssets()
  const { data: accountAssets, isInitialLoading } = useAccountBalances()

  const relatedAToken = assetId ? getRelatedAToken(assetId) : undefined

  const accountBalances = useMemo(
    () => accountAssets?.balances ?? [],
    [accountAssets?.balances],
  )

  const { data: reserves, isLoading: isLoadingReserves } =
    useStableSwapReserves(relatedAToken ? assetId ?? "" : "")

  const { getAssetPrice, isLoading: isPriceLoading } = useAssetsPrice(
    relatedAToken && assetId
      ? accountBalances.map(({ asset }) => asset.id) ?? []
      : [],
  )

  const data = useMemo(() => {
    if (!reserves || !account || !accountAssets || !assetId) return DOT_ASSET_ID

    const stableswapBalance =
      accountAssets.accountAssetsMap.get(assetId)?.balance.transferable ?? "0"

    if (BigNumber(stableswapBalance).gt(0)) return assetId

    let highestReserveBalance:
      | { balance: BigNumber; assetId: string }
      | undefined

    for (const reserve of reserves.balances) {
      const balance = accountAssets.accountAssetsMap.get(reserve.id)?.balance
        .transferable

      if (balance) {
        const price = getAssetPrice(reserve.id).price
        const displayBalance = !BigNumber(price).isNaN()
          ? BigNumber(balance).shiftedBy(-reserve.decimals).times(price)
          : BN_0

        if (displayBalance.gt(highestReserveBalance?.balance ?? 0)) {
          highestReserveBalance = {
            balance: displayBalance,
            assetId: reserve.id,
          }
        }
      }

      const underlyingAssetId = getErc20(reserve.id)?.underlyingAssetId
      const underlyingBalance = underlyingAssetId
        ? accountAssets.accountAssetsMap.get(underlyingAssetId)?.balance
            .transferable
        : undefined

      if (underlyingBalance && underlyingAssetId) {
        const price = getAssetPrice(underlyingAssetId).price
        const meta = getAssetWithFallback(underlyingAssetId)
        const displayBalance = !BigNumber(price).isNaN()
          ? BigNumber(underlyingBalance).shiftedBy(-meta.decimals).times(price)
          : BN_0

        if (displayBalance.gt(highestReserveBalance?.balance ?? 0)) {
          highestReserveBalance = {
            balance: displayBalance,
            assetId: underlyingAssetId,
          }
        }
      }
    }

    if (highestReserveBalance) return highestReserveBalance.assetId

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
          !balance.asset.isExternal &&
          relatedAToken?.id !== balance.asset.id
        )
      })

    if (highestBalance) return highestBalance.asset.id

    return DOT_ASSET_ID
  }, [
    reserves,
    account,
    accountAssets,
    assetId,
    accountBalances,
    getAssetPrice,
    getAssetWithFallback,
    getErc20,
    relatedAToken,
  ])

  return {
    isLoading: isLoadingReserves || isInitialLoading || isPriceLoading,
    data,
  }
}
