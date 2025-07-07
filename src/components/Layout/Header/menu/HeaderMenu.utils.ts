import { useIsAccountBalance, useIsAccountPositions } from "api/deposits"
import { useVestingTotalVestedAmount } from "api/vesting"

import { useVisibleElements } from "hooks/useVisibleElements"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { MENU_ITEMS } from "utils/navigation"

export const useActiveMenuItems = () => {
  const { featureFlags } = useRpcProvider()
  const { data: totalVestedAmount } = useVestingTotalVestedAmount()
  const { isPositions } = useIsAccountPositions()
  const { isBalance } = useIsAccountBalance()

  const isAnyPositions = isPositions || isBalance

  return useMemo(() => {
    return MENU_ITEMS.filter(
      (item) => item.enabled && !(item.asyncEnabled && !featureFlags[item.key]),
    ).map(
      (item) =>
        ({
          ...item,
          subItems: item.subItems?.filter((subItem) => {
            if (subItem.key === "liquidity.myLiquidity") {
              return isAnyPositions
            }

            if (subItem.key === "wallet.vesting") {
              return !!totalVestedAmount?.gt(0)
            }

            return subItem.enabled
          }),
        }) as (typeof MENU_ITEMS)[number],
    )
  }, [featureFlags, isAnyPositions, totalVestedAmount])
}

export const useVisibleHeaderMenuItems = () => {
  const { hiddenElementsKeys, observe } = useVisibleElements()

  const items = useActiveMenuItems()

  return useMemo(() => {
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
  }, [hiddenElementsKeys, items, observe])
}
