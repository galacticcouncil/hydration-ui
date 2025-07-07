import { Root, Trigger } from "@radix-ui/react-tooltip"
import { Link, Search, useSearch } from "@tanstack/react-location"
import {
  SItem,
  SList,
  SNoFunBadge,
} from "components/Layout/Header/menu/HeaderMenu.styled"
import { Trans, useTranslation } from "react-i18next"
import { LINKS, MENU_ITEMS, resetSearchParams, TabItem } from "utils/navigation"
import { HeaderSubMenu, HeaderSubMenuContents } from "./HeaderSubMenu"
import { useState } from "react"
import { useRpcProvider } from "providers/rpcProvider"
import IconChevron from "assets/icons/ChevronDown.svg?react"
import { useVisibleHeaderMenuItems } from "./HeaderMenu.utils"
import { useIsAccountBalance, useIsAccountPositions } from "api/deposits"

export const HeaderMenu = () => {
  const { t } = useTranslation()
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const { items, visibleItemKeys, hiddenItems, moreButtonKey, observe } =
    useVisibleHeaderMenuItems()

  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null)

  return (
    <Root delayDuration={0} open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
      <SList ref={observe}>
        {items.map((item) => (
          <div
            key={item.key}
            data-intersect={item.key}
            css={{ position: "relative" }}
          >
            <HeaderMenuItem
              item={item}
              moreButtonKey={moreButtonKey}
              onMoreButtonClick={() => setMoreMenuOpen((prev) => !prev)}
              isSubmenuOpen={activeSubMenu === item.key}
              isHidden={
                item.key === moreButtonKey ||
                !visibleItemKeys.includes(item.key)
              }
              onSubmenuOpenChange={() =>
                setActiveSubMenu((prev) =>
                  prev === item.key ? null : item.key,
                )
              }
            />
          </div>
        ))}
      </SList>
      {hiddenItems.length > 0 && (
        <HeaderSubMenuContents
          onItemClick={() => setMoreMenuOpen(false)}
          items={hiddenItems.map((item) => ({
            ...item,
            title:
              item.href === LINKS.memepad ? (
                <>
                  {t(`header.${item.key}`)}
                  <SNoFunBadge sx={{ left: -20, top: -14 }}>
                    <Trans t={t} i18nKey="memepad.badge.nofun">
                      <span />
                      <span />
                    </Trans>
                  </SNoFunBadge>
                </>
              ) : (
                t(`header.${item.key}`)
              ),
          }))}
        />
      )}
    </Root>
  )
}

const HeaderMenuItem: React.FC<{
  item: TabItem
  isSubmenuOpen: boolean
  moreButtonKey?: string
  isHidden: boolean
  onMoreButtonClick: () => void
  onSubmenuOpenChange: () => void
}> = ({
  item,
  isSubmenuOpen,
  moreButtonKey,
  isHidden,
  onSubmenuOpenChange,
  onMoreButtonClick,
}) => {
  const { t } = useTranslation()
  const search = useSearch()
  const { isLoaded } = useRpcProvider()

  const isMoreButton = moreButtonKey === item.key

  if (item.subItems?.length && !isMoreButton) {
    return (
      <HeaderSubMenu
        item={item}
        isOpen={isSubmenuOpen}
        onOpenChange={onSubmenuOpenChange}
        isHidden={isHidden}
      />
    )
  }

  if (item.external && !isMoreButton) {
    return (
      <a href={item.href} css={isHidden ? { pointerEvents: "none" } : {}}>
        <SItem isHidden={isHidden}>{t(`header.${item.key}`)}</SItem>
      </a>
    )
  }

  const isLiquidityLink =
    (LINKS.allPools === item.href || LINKS.myLiquidity === item.href) &&
    !isMoreButton

  if (isLoaded && isLiquidityLink) {
    return <LiquidityMenuItem item={item} search={search} isHidden={isHidden} />
  }

  return (
    <MenuItem
      item={item}
      search={search}
      isHidden={isHidden}
      moreButton={
        moreButtonKey === item.key ? (
          <Trigger
            asChild
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onMoreButtonClick()
            }}
            onPointerDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <SItem>
              {t("header.more")}
              <IconChevron />
            </SItem>
          </Trigger>
        ) : undefined
      }
    />
  )
}

const LiquidityMenuItem = ({
  item,
  search,
  isHidden,
}: {
  item: (typeof MENU_ITEMS)[number]
  search: Partial<Search<unknown>>
  isHidden: boolean
}) => {
  const { t } = useTranslation()

  const { isPositions } = useIsAccountPositions()
  const { isBalance } = useIsAccountBalance()

  const isAnyPositions = isPositions || isBalance
  console.log({ isAnyPositions })
  return (
    <Link
      to={isAnyPositions ? LINKS.myLiquidity : item.href}
      search={resetSearchParams(search)}
      key={isAnyPositions ? LINKS.myLiquidity : item.href}
      css={isHidden ? { pointerEvents: "none" } : {}}
    >
      {({ isActive }) => (
        <SItem isActive={isActive} isHidden={isHidden}>
          {t(`header.${item.key}`)}
        </SItem>
      )}
    </Link>
  )
}

const MenuItem = ({
  item,
  search,
  moreButton,
  isHidden,
}: {
  item: (typeof MENU_ITEMS)[number]
  search: Partial<Search<unknown>>
  moreButton?: React.ReactNode
  isHidden: boolean
}) => {
  const { t } = useTranslation()
  const hasSubmenuDropdown = (item.subItems?.length ?? 0) > 1

  return (
    <Link
      to={item.href}
      search={resetSearchParams(search)}
      css={isHidden ? { pointerEvents: "none" } : {}}
    >
      {({ isActive }) => {
        return (
          <>
            <SItem isActive={isActive} isHidden={isHidden}>
              {t(`header.${item.key}`)}
              {/* Extra icon needed to prevent layout shift when item with submenu is hidden due to showing more menu button */}
              {hasSubmenuDropdown && <IconChevron sx={{ flexShrink: 0 }} />}
              {LINKS.memepad === item.href && (
                <SNoFunBadge
                  css={{ position: "absolute" }}
                  sx={{ top: 0, right: 0 }}
                >
                  <Trans t={t} i18nKey="memepad.badge.nofun">
                    <span />
                    <span />
                  </Trans>
                </SNoFunBadge>
              )}
            </SItem>
            {!!moreButton && (
              <span
                css={{
                  top: 0,
                  left: 0,
                  position: "absolute",
                  pointerEvents: "auto",
                }}
              >
                {moreButton}
              </span>
            )}
          </>
        )
      }}
    </Link>
  )
}
