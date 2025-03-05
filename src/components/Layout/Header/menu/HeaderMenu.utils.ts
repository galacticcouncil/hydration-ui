import { useAccountData } from "api/deposits"
import { useVestingTotalVestedAmount } from "api/vesting"
import { useShallow } from "hooks/useShallow"

import { useVisibleElements } from "hooks/useVisibleElements"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { MENU_ITEMS } from "utils/navigation"

export const useVisibleHeaderMenuItems = () => {
  const { hiddenElementsKeys, observe } = useVisibleElements()
  const { featureFlags } = useRpcProvider()

  const isPositions = useAccountData(useShallow((state) => state.isPositions))

  const { data: totalVestedAmount } = useVestingTotalVestedAmount()

  const isPoolBalances = isPositions

  return useMemo(() => {
    const items = MENU_ITEMS.filter(
      (item) => item.enabled && !(item.asyncEnabled && !featureFlags[item.key]),
    ).map(
      (item) =>
        ({
          ...item,
          subItems: item.subItems?.filter((subItem) => {
            if (subItem.key === "liquidity.myLiquidity") {
              return isPoolBalances
            }

            if (subItem.key === "wallet.vesting") {
              return !!totalVestedAmount?.gt(0)
            }

            return subItem.enabled
          }),
        }) as (typeof MENU_ITEMS)[number],
    )

    const visibleItemKeys = items
      .filter((item) => !hiddenElementsKeys.includes(item.key))
      .map((item) => item.key)

    const shouldShowMoreButton = visibleItemKeys.length < items.length

    const moreButtonKey = shouldShowMoreButton
      ? visibleItemKeys[visibleItemKeys.length - 1]
      : undefined

    const hiddenItemsKeys =
      shouldShowMoreButton && moreButtonKey
        ? hiddenElementsKeys.concat([moreButtonKey])
        : []

    const hiddenItems = items.filter((item) =>
      hiddenItemsKeys.includes(item.key),
    )

    return { items, visibleItemKeys, hiddenItems, moreButtonKey, observe }
  }, [
    featureFlags,
    hiddenElementsKeys,
    observe,
    isPoolBalances,
    totalVestedAmount,
  ])
}
