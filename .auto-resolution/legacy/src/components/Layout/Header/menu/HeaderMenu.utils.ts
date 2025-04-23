import { useVisibleElements } from "hooks/useVisibleElements"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { MENU_ITEMS } from "utils/navigation"

export const useVisibleHeaderMenuItems = () => {
  const { hiddenElementsKeys, observe } = useVisibleElements()
  const { featureFlags } = useRpcProvider()

  return useMemo(() => {
    const items = MENU_ITEMS.filter(
      (item) => item.enabled && !(item.asyncEnabled && !featureFlags[item.key]),
    )

    const visibleItems = items.filter(
      (item) => !hiddenElementsKeys.includes(item.key),
    )

    const shouldShowMoreButton = visibleItems.length < items.length

    const moreButtonKey = shouldShowMoreButton
      ? visibleItems[visibleItems.length - 1]?.key
      : undefined

    const hiddenItemsKeys =
      shouldShowMoreButton && moreButtonKey
        ? hiddenElementsKeys.concat([moreButtonKey])
        : []

    const hiddenItems = items.filter((item) =>
      hiddenItemsKeys.includes(item.key),
    )

    return { items, visibleItems, hiddenItems, moreButtonKey, observe }
  }, [featureFlags, hiddenElementsKeys, observe])
}
