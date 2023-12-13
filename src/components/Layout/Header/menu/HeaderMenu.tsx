import { Link, useSearch } from "@tanstack/react-location"
import { SItem, SList } from "components/Layout/Header/menu/HeaderMenu.styled"
import { useTranslation } from "react-i18next"
import { MENU_ITEMS } from "utils/navigation"
import { HeaderSubMenu } from "./HeaderSubMenu"
import { Dispatch, SetStateAction, forwardRef, useEffect } from "react"
import { useRpcProvider } from "providers/rpcProvider"

export const HeaderMenu = forwardRef<
  HTMLElement,
  { rerender: Dispatch<SetStateAction<boolean>> }
>(({ rerender }, ref) => {
  const { t } = useTranslation()
  const { account } = useSearch()
  const { featureFlags } = useRpcProvider()

  const filteredItems = MENU_ITEMS.filter(
    (item) => item.enabled && !(item.asyncEnabled && !featureFlags[item.key]),
  )

  useEffect(() => {
    rerender((trigger) => !trigger)
  }, [filteredItems.length, rerender])

  return (
    <SList ref={ref}>
      {filteredItems.map((item, i) => {
        if (!item.enabled) {
          return null
        }

        if (item.asyncEnabled && !featureFlags[item.key]) {
          return null
        }

        if (item.subItems?.length) {
          return <HeaderSubMenu key={i} item={item} />
        }

        if (item.external) {
          return (
            <a href={item.href} key={i} data-intersect={item.key}>
              <SItem>{t(`header.${item.key}`)}</SItem>
            </a>
          )
        }

        return (
          <Link
            to={item.href}
            search={account ? { account } : undefined}
            key={i}
            data-intersect={item.key}
          >
            {({ isActive }) => (
              <SItem isActive={isActive}>{t(`header.${item.key}`)}</SItem>
            )}
          </Link>
        )
      })}
    </SList>
  )
})
