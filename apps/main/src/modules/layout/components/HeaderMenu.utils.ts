import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import {
  bottomNavOrder,
  getMenuTranslations,
  LINKS,
  topNavOrder,
} from "@/config/navigation"
import { useVisibleElements } from "@/hooks/useVisibleElements"
import { useHasTopNavbar } from "@/modules/layout/hooks/useHasTopNavbar"
import { useNavigation } from "@/modules/layout/hooks/useNavigation"

export const useMenuTranslations = () => {
  const { t } = useTranslation(["common"])

  return useMemo(() => getMenuTranslations(t), [t])
}

export const useVisibleHeaderMenuItems = <T extends HTMLElement>() => {
  const hasTopNavbar = useHasTopNavbar()
  const navigation = useNavigation()
  const { hiddenElementsKeys, observe } = useVisibleElements<T>()

  return useMemo(() => {
    const order = hasTopNavbar ? topNavOrder : bottomNavOrder
    const items = navigation.toSorted(
      (item1, item2) => order.indexOf(item1.key) - order.indexOf(item2.key),
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

    return {
      items,
      visibleItemKeys,
      hiddenItems,
      moreButtonKey,
      observe,
    }
  }, [hiddenElementsKeys, observe, hasTopNavbar, navigation])
}

export const HIDDEN_DESKTOP_NAV_ROUTES = [LINKS.submitTransaction]
export const HIDDEN_MOBILE_NAV_ROUTES = [
  LINKS.submitTransaction,
  "/liquidity/$id",
]
