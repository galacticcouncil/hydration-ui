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
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { TabItemWithSubItems, resetSearchParams } from "utils/navigation"
import {
  SArrow,
  SItem,
  SSubMenu,
  SSubMenuContainer,
  SSubMenuItem,
} from "./HeaderMenu.styled"
import { MobileNavBarItem } from "components/Layout/Header/MobileNavBar/MobileNavBarItem"

type Props = { item: TabItemWithSubItems }

export const HeaderSubMenu = ({ item }: Props) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const isTablet = useMedia(theme.viewport.gte.sm)

  const match = useMatchRoute()

  const { key, subItems } = item
  const isActive = subItems.some(({ href }) => match({ to: href }))
  const filteredItems = subItems.filter((subItem) => subItem.enabled)

  return (
    <Root delayDuration={0} open={open} onOpenChange={setOpen}>
      <Trigger
        css={{ all: "unset", height: "100%", cursor: "pointer" }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((prev) => !prev)

          const firstLink = filteredItems?.[0]
          isTablet && firstLink && navigate({ to: firstLink.href })
        }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        {isTablet ? (
          <SItem isActive={isActive}>
            {t(`header.${key}`)}
            <IconChevron />
          </SItem>
        ) : (
          <MobileNavBarItem item={item} isActive={open || isActive} />
        )}
      </Trigger>
      <HeaderSubMenuContents
        items={filteredItems.map((subItem) => ({
          ...subItem,
          title: t(`header.${key}.${subItem.key}.title`),
          subtitle: t(`header.${key}.${subItem.key}.subtitle`),
        }))}
        onItemClick={() => setOpen(false)}
      />
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
                <Icon sx={{ color: "brightBlue300", width: 24, height: 24 }} />
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
