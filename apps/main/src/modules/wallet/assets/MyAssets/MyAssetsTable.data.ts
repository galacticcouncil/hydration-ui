import Big from "big.js"
import { useMemo } from "react"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { MyAsset } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountData } from "@/states/account"
import { useAssetsPrice } from "@/states/displayAsset"
import { getAssetOrigin } from "@/utils/externalAssets"
import { scaleHuman } from "@/utils/formatting"

export const useMyAssetsTableData = (showAllAssets: boolean) => {
  const { native, all, isExternal, tradable } = useAssets()
  const { balances, isBalanceLoading } = useAccountData(
    useShallow(pick(["balances", "isBalanceLoading"])),
  )

  const assetsWithBalance = useMemo(
    () =>
      showAllAssets
        ? Array.from(all.values()).map((asset) => ({
            ...asset,
            balance: balances[asset.id],
          }))
        : Object.entries(balances)
            .map(([assetId, balance]) => {
              const asset = all.get(assetId)

              if (!asset) {
                return null
              }

              return {
                ...asset,
                balance,
              }
            })
            .filter((asset) => !!asset),
    [all, balances, showAllAssets],
  )

  const { isLoading: arePricesLoading, prices } = useAssetsPrice(
    assetsWithBalance.map((asset) => asset.id),
  )

  const isLoading = arePricesLoading || isBalanceLoading

  const tableAssets = useMemo(() => {
    if (isLoading) {
      return []
    }

    return assetsWithBalance
      .filter((asset) => !isExternal(asset) || !!asset.name)
      .map<MyAsset>((asset) => {
        const price = prices[asset.id]
        const priceBig = new Big(price?.isValid ? price.price : "0")

        const total = scaleHuman(
          balances[asset.id]?.total ?? 0n,
          asset.decimals,
        )

        const transferable = scaleHuman(
          balances[asset.id]?.free ?? 0n,
          asset.decimals,
        )

        const reserved = scaleHuman(
          balances[asset.id]?.reserved ?? 0n,
          asset.decimals,
        )

        return {
          ...asset,
          origin: getAssetOrigin(asset),
          total,
          totalDisplay: priceBig.times(total).toString(),
          transferable,
          transferableDisplay: priceBig.times(transferable).toString(),
          // TODO what is this other reserved?
          reserved: "0",
          reservedDca: reserved,
          canStake: asset.id === native.id,
          rugCheckData: undefined,
          isTradeable: tradable.some(
            (tradeAsset) => tradeAsset.id === asset.id,
          ),
        }
      })
  }, [
    native.id,
    balances,
    isExternal,
    tradable,
    prices,
    assetsWithBalance,
    isLoading,
  ])

  return {
    data: tableAssets,
    isLoading,
  }
}
