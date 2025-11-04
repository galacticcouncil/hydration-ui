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
import React from "react"
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

type HeaderSubMenuProps = {
  isOpen: boolean
  onOpenChange: () => void
  item: TabItemWithSubItems
  isHidden?: boolean
}

export const HeaderSubMenu: React.FC<HeaderSubMenuProps> = ({
  item,
  isOpen,
  onOpenChange,
  isHidden,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const isTablet = useMedia(theme.viewport.gte.sm)

  const match = useMatchRoute()

  const { href, key, subItems, disabled } = item

  const isActive = subItems.some(({ href }) => match({ to: href }))

  const shouldRenderDropdown = item.subItems.length > 1

  return (
    <Root delayDuration={0} open={isOpen} onOpenChange={onOpenChange}>
      <Trigger
        css={{
          all: "unset",
          height: "100%",
          ...(isHidden ? { pointerEvents: "none" } : { cursor: "pointer" }),
          ...(disabled
            ? { pointerEvents: "none", cursor: "not-allowed", opacity: 0.5 }
            : {}),
        }}
        onClick={(e) => {
          if (disabled) return

          e.preventDefault()
          e.stopPropagation()
          onOpenChange()

          const firstLink = item.subItems[0]

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
          <SItem isActive={isActive} isHidden={isHidden}>
            {t(`header.${key}`)}
            {shouldRenderDropdown && <IconChevron sx={{ flexShrink: 0 }} />}
          </SItem>
        ) : (
          <MobileNavBarItem item={item} isActive={isOpen || isActive} />
        )}
      </Trigger>
      {shouldRenderDropdown && (
        <HeaderSubMenuContents
          items={item.subItems.map((subItem) => ({
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
    disabled?: boolean
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
          {items.map(({ key, title, subtitle, href, Icon, disabled }) => (
            <Link
              key={key}
              to={href}
              search={resetSearchParams(search)}
              onClick={onItemClick}
              disabled={disabled}
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
