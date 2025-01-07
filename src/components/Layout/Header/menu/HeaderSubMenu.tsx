import { Portal, Root, Trigger } from "@radix-ui/react-tooltip"
import {
  Link,
  useMatchRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-location"
import IconChevron from "assets/icons/ChevronDown.svg?react"
import IconArrow from "assets/icons/IconArrow.svg?react"
import { Text } from "components/Typography/Text/Text"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { LINKS, TabItemWithSubItems, resetSearchParams } from "utils/navigation"
import {
  SArrow,
  SItem,
  SSubMenu,
  SSubMenuContainer,
  SSubMenuItem,
} from "./HeaderMenu.styled"
import { MobileNavBarItem } from "components/Layout/Header/MobileNavBar/MobileNavBarItem"
import { useAccountAssets } from "api/deposits"
import { useVestingTotalVestedAmount } from "api/vesting"

type HeaderSubMenuProps = {
  isOpen: boolean
  onOpenChange: () => void
  item: TabItemWithSubItems
}

export const HeaderSubMenu: React.FC<HeaderSubMenuProps> = ({
  item,
  isOpen,
  onOpenChange,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const isTablet = useMedia(theme.viewport.gte.sm)

  const match = useMatchRoute()

  const balances = useAccountAssets()

  const isPoolBalances = !!balances.data?.isAnyPoolPositions

  const { data: totalVestedAmount } = useVestingTotalVestedAmount()

  const { href, key, subItems } = item
  const isActive = subItems.some(({ href }) => match({ to: href }))

  const filteredItems = useMemo(() => {
    return subItems.filter((subItem) => {
      if (subItem.key === "liquidity.myLiquidity") {
        return isPoolBalances
      }

      if (subItem.key === "wallet.vesting") {
        return !!totalVestedAmount?.gt(0)
      }

      return subItem.enabled
    })
  }, [isPoolBalances, subItems, totalVestedAmount])

  const shouldRenderDropdown = filteredItems.length > 1

  return (
    <Root delayDuration={0} open={isOpen} onOpenChange={onOpenChange}>
      <Trigger
        css={{ all: "unset", height: "100%", cursor: "pointer" }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onOpenChange()

          const firstLink = filteredItems?.[0]

          if (href === LINKS.borrow) {
            navigate({ to: href })
          } else {
            navigate({ to: firstLink?.href ?? href })
          }
        }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        {isTablet ? (
          <SItem isActive={isActive}>
            {t(`header.${key}`)}
            {shouldRenderDropdown && <IconChevron />}
          </SItem>
        ) : (
          <MobileNavBarItem item={item} isActive={isOpen || isActive} />
        )}
      </Trigger>
      {shouldRenderDropdown && (
        <HeaderSubMenuContents
          items={filteredItems.map((subItem) => ({
            ...subItem,
            title: t(`header.${subItem.key}.title`),
            subtitle: t(`header.${subItem.key}.subtitle`),
          }))}
          onItemClick={onOpenChange}
        />
      )}
    </Root>
  )
}

type HeaderSubMenuContentsProps = {
  items: {
    key: string
    title: React.ReactNode
    subtitle?: string
    href: string
    Icon: React.FC
  }[]
  onItemClick?: () => void
}

export const HeaderSubMenuContents: React.FC<HeaderSubMenuContentsProps> = ({
  items,
  onItemClick,
}) => {
  const isTablet = useMedia(theme.viewport.gte.sm)
  const search = useSearch()
  return (
    <Portal>
      <SSubMenuContainer
        side="bottom"
        align="start"
        sideOffset={isTablet ? 4 : 16}
        alignOffset={-40}
        collisionPadding={16}
      >
        <SSubMenu>
          {items.map(({ key, title, subtitle, href, Icon }) => (
            <Link
              key={key}
              to={href}
              search={resetSearchParams(search)}
              onClick={onItemClick}
            >
              <SSubMenuItem>
                <Icon
                  sx={{
                    flexShrink: 0,
                    color: "brightBlue300",
                    width: 24,
                    height: 24,
                  }}
                />
                <div>
                  <Text fs={15} lh={15}>
                    {title}
                  </Text>
                  <Text fs={12} lh={16} color="basic500">
                    {subtitle}
                  </Text>
                </div>
                <SArrow>
                  <IconArrow />
                </SArrow>
              </SSubMenuItem>
            </Link>
          ))}
        </SSubMenu>
      </SSubMenuContainer>
    </Portal>
  )
}
