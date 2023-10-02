import { Portal, Root, Trigger } from "@radix-ui/react-tooltip"
import { Link, useMatchRoute, useSearch } from "@tanstack/react-location"
import IconChevron from "assets/icons/ChevronDown.svg?react"
import IconArrow from "assets/icons/IconArrow.svg?react"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { TabItemWithSubItems } from "utils/navigation"
import { MobileNavBarItem } from "components/Layout/Header/MobileNavBar/MobileNavBar"
import {
  SArrow,
  SItem,
  SSubMenu,
  SSubMenuContainer,
  SSubMenuItem,
} from "./HeaderMenu.styled"

type Props = { item: TabItemWithSubItems }

export const HeaderSubMenu = ({ item }: Props) => {
  const { t } = useTranslation()
  const { account } = useSearch()
  const [open, setOpen] = useState(false)

  const isDesktop = useMedia(theme.viewport.gte.md)
  const match = useMatchRoute()

  const { key, subItems } = item
  const isActive = subItems.some(({ href }) => match({ to: href }))

  return (
    <Root delayDuration={0} open={open} onOpenChange={setOpen}>
      <Trigger
        css={{ all: "unset", height: "100%", cursor: "pointer" }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((prev) => !prev)
        }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        {isDesktop ? (
          <SItem>
            {t(`header.${key}`)}
            <IconChevron />
          </SItem>
        ) : (
          <MobileNavBarItem item={item} isActive={open || isActive} />
        )}
      </Trigger>
      <Portal>
        <SSubMenuContainer
          side="bottom"
          align="start"
          sideOffset={isDesktop ? 4 : 16}
          alignOffset={-40}
          collisionPadding={16}
        >
          <SSubMenu>
            {subItems
              .filter((subItem) => subItem.enabled)
              .map((subItem) => (
                <Link
                  key={subItem.key}
                  to={subItem.href}
                  search={account ? { account } : undefined}
                >
                  <SSubMenuItem>
                    <subItem.Icon sx={{ color: "brightBlue300" }} />
                    <div>
                      <Text fs={15} lh={15}>
                        {t(`header.${key}.${subItem.key}.title`)}
                      </Text>
                      <Text fs={12} lh={16} color="basic500">
                        {t(`header.${key}.${subItem.key}.subtitle`)}
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
    </Root>
  )
}
