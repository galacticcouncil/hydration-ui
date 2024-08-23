import { Root, Trigger } from "@radix-ui/react-tooltip"
import { Link, Search, useSearch } from "@tanstack/react-location"
import {
  SItem,
  SList,
  SNoFunBadge,
} from "components/Layout/Header/menu/HeaderMenu.styled"
import { Trans, useTranslation } from "react-i18next"
import { LINKS, MENU_ITEMS, resetSearchParams } from "utils/navigation"
import { HeaderSubMenu, HeaderSubMenuContents } from "./HeaderSubMenu"
import { useState } from "react"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useAccountNFTPositions } from "api/deposits"
import { useAccountBalances } from "api/accountBalances"
import IconChevron from "assets/icons/ChevronDown.svg?react"
import { useVisibleHeaderMenuItems } from "./HeaderMenu.utils"

export const HeaderMenu = () => {
  const { t } = useTranslation()
  const search = useSearch()
  const { isLoaded } = useRpcProvider()
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const { items, hiddenItems, moreButtonKey, observe } =
    useVisibleHeaderMenuItems()

  return (
    <Root delayDuration={0} open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
      <div sx={{ flex: "row" }}>
        <SList ref={observe}>
          {items.map((item, i) => {
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

            const isLiquidityLink =
              LINKS.allPools === item.href || LINKS.myLiquidity === item.href

            if (isLoaded && isLiquidityLink) {
              return <LiquidityMenuItem key={i} item={item} search={search} />
            }

            return (
              <MenuItem
                key={i}
                item={item}
                search={search}
                moreButton={
                  moreButtonKey === item.key ? (
                    <Trigger
                      asChild
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setMoreMenuOpen((prev) => !prev)
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
          })}
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

const LiquidityMenuItem = ({
  item,
  search,
}: {
  item: (typeof MENU_ITEMS)[number]
  search: Partial<Search<unknown>>
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { assets } = useRpcProvider()
  const accountPositions = useAccountNFTPositions()

  const balances = useAccountBalances(account?.address)

  const isPoolBalances = balances.data?.balances.some((balance) => {
    if (balance.freeBalance.gt(0)) {
      const meta = assets.getAsset(balance.id)
      return meta.isStableSwap || meta.isShareToken
    }
    return false
  })

  const isPositions =
    accountPositions.data?.miningNfts.length ||
    accountPositions.data?.omnipoolNfts.length ||
    isPoolBalances

  return (
    <Link
      to={isPositions ? LINKS.myLiquidity : item.href}
      search={resetSearchParams(search)}
      key={isPositions ? LINKS.myLiquidity : item.href}
      data-intersect={item.key}
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
      data-intersect={item.key}
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
