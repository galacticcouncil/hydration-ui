import { Link, Search, useSearch } from "@tanstack/react-location"
import { SItem, SList } from "components/Layout/Header/menu/HeaderMenu.styled"
import { useTranslation } from "react-i18next"
import { LINKS, MENU_ITEMS, resetSearchParams } from "utils/navigation"
import { HeaderSubMenu } from "./HeaderSubMenu"
import { forwardRef } from "react"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useAccountOmnipoolPositions } from "sections/pools/PoolsPage.utils"
import { useTokensBalances } from "api/balances"

export const HeaderMenu = forwardRef<HTMLElement>((_, ref) => {
  const { t } = useTranslation()
  const search = useSearch()

  const { featureFlags, isLoaded } = useRpcProvider()

  const filteredItems = MENU_ITEMS.filter(
    (item) => item.enabled && !(item.asyncEnabled && !featureFlags[item.key]),
  )

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

        if (
          (LINKS.allPools === item.href || LINKS.myLiquidity === item.href) &&
          isLoaded
        )
          return <LiquidityMenuItem item={item} search={search} i={i} />

        return (
          <Link
            to={item.href}
            search={resetSearchParams(search)}
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

const LiquidityMenuItem = ({
  item,
  search,
  i,
}: {
  item: (typeof MENU_ITEMS)[number]
  search: Partial<Search<unknown>>
  i: number
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { assets } = useRpcProvider()
  const accountPositions = useAccountOmnipoolPositions()

  const shareTokensId = assets.shareTokens.map((shareToken) => shareToken.id)
  const stableswapsId = assets.stableswap.map((shareToken) => shareToken.id)

  const userPositions = useTokensBalances(
    [...shareTokensId, ...stableswapsId],
    account?.address,
  )

  const isOmnipoolPositions =
    accountPositions.data?.miningNfts.length ||
    accountPositions.data?.omnipoolNfts.length ||
    userPositions.some((userPosition) => userPosition.data?.freeBalance.gt(0))

  return (
    <Link
      to={isOmnipoolPositions ? LINKS.myLiquidity : item.href}
      search={resetSearchParams(search)}
      key={isOmnipoolPositions ? LINKS.myLiquidity : item.href}
      data-intersect={isOmnipoolPositions ? LINKS.myLiquidity : item.href}
    >
      {({ isActive }) => (
        <SItem isActive={isActive}>{t(`header.${item.key}`)}</SItem>
      )}
    </Link>
  )
}
