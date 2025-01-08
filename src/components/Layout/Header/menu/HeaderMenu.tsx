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
import { useAccountAssets } from "api/deposits"

export const HeaderMenu = () => {
  const { t } = useTranslation()
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const { items, hiddenItems, moreButtonKey, observe } =
    useVisibleHeaderMenuItems()

  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null)

  return (
    <Root delayDuration={0} open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
      <div sx={{ flex: "row" }}>
        <SList ref={observe}>
          {items.map((item) => (
            <div key={item.key} data-intersect={item.key}>
              <HeaderMenuItem
                item={item}
                moreButtonKey={moreButtonKey}
                onMoreButtonClick={() => setMoreMenuOpen((prev) => !prev)}
                isSubmenuOpen={activeSubMenu === item.key}
                onSubmenuOpenChange={() =>
                  setActiveSubMenu((prev) =>
                    prev === item.key ? null : item.key,
                  )
                }
              />
            </div>
          ))}
        </SList>
      </div>
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
  onMoreButtonClick: () => void
  onSubmenuOpenChange: () => void
}> = ({
  item,
  isSubmenuOpen,
  moreButtonKey,
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
      />
    )
  }

  if (item.external && !isMoreButton) {
    return (
      <a href={item.href}>
        <SItem>{t(`header.${item.key}`)}</SItem>
      </a>
    )
  }

  const isLiquidityLink =
    (LINKS.allPools === item.href || LINKS.myLiquidity === item.href) &&
    !isMoreButton

  if (isLoaded && isLiquidityLink) {
    return <LiquidityMenuItem item={item} search={search} />
  }

  return (
    <MenuItem
      item={item}
      search={search}
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
              {t("header.more")} <IconChevron />
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
}: {
  item: (typeof MENU_ITEMS)[number]
  search: Partial<Search<unknown>>
}) => {
  const { t } = useTranslation()
  const { data } = useAccountAssets()

  return (
    <Link
      to={data?.isAnyPoolPositions ? LINKS.myLiquidity : item.href}
      search={resetSearchParams(search)}
      key={data?.isAnyPoolPositions ? LINKS.myLiquidity : item.href}
    >
      {({ isActive }) => (
        <SItem isActive={isActive}>{t(`header.${item.key}`)}</SItem>
      )}
    </Link>
  )
}

const MenuItem = ({
  item,
  search,
  moreButton,
}: {
  item: (typeof MENU_ITEMS)[number]
  search: Partial<Search<unknown>>
  moreButton?: React.ReactNode
}) => {
  const { t } = useTranslation()

  return (
    <Link
      to={item.href}
      onClick={(e) => {
        if (moreButton) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
      search={resetSearchParams(search)}
    >
      {({ isActive }) => {
        return (
          <span sx={{ flex: "row" }} css={{ position: "relative" }}>
            <SItem
              isActive={isActive}
              css={{
                opacity: moreButton ? 0 : 1,
              }}
            >
              {t(`header.${item.key}`)}
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
              <span sx={{ flex: "row" }} css={{ position: "absolute" }}>
                {moreButton}
              </span>
            )}
          </span>
        )
      }}
    </Link>
  )
}
