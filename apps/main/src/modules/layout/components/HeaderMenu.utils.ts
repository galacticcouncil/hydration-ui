import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import {
  bottomNavOrder,
  NAVIGATION,
  NavigationKey,
  topNavOrder,
} from "@/config/navigation"
import { useVisibleElements } from "@/hooks/useVisibleElements"
import { useHasTopNavbar } from "@/modules/layout/use-has-top-navbar"

export const useMenuTranslations = () => {
  const { t } = useTranslation(["common"])

  return useMemo(
    () =>
      ({
        home: {
          title: t("navigation.home.title"),
          description: "",
        },
        liquidity: {
          title: t("navigation.liquidity.title"),
          description: "",
        },
        myLiquidity: {
          title: t("navigation.myLiquidity.title"),
          description: "",
        },
        allPools: {
          title: t("navigation.allPools.title"),
          description: "",
        },
        omnipool: {
          title: t("navigation.omnipool.title"),
          description: "",
        },
        isolated: {
          title: t("navigation.isolated.title"),
          description: "",
        },
        lbp: {
          title: t("navigation.lbp.title"),
          description: t("navigation.lbp.description"),
        },
        wallet: {
          title: t("navigation.wallet.title"),
          description: "",
        },
        walletAssets: {
          title: t("navigation.walletAssets.title"),
          description: "",
        },
        walletTransactions: {
          title: t("navigation.walletTransactions.title"),
          description: "",
        },
        walletVesting: {
          title: t("navigation.walletVesting.title"),
          description: "",
        },
        crossChain: {
          title: t("navigation.crossChain.title"),
          description: "",
        },
        bridge: {
          title: t("navigation.bridge.title"),
          description: "",
        },
        trade: {
          title: t("navigation.trade.title"),
          description: "",
        },
        swap: {
          title: t("navigation.swap.title"),
          description: t("navigation.swap.description"),
        },
        otc: {
          title: t("navigation.otc.title"),
          description: t("navigation.otc.description"),
        },
        dca: {
          title: t("navigation.dca.title"),
          description: t("navigation.dca.description"),
        },
        yieldDca: {
          title: t("navigation.yieldDca.title"),
          description: t("navigation.yieldDca.description"),
        },
        bonds: {
          title: t("navigation.bonds.title"),
          description: t("navigation.bonds.description"),
        },
        bond: {
          title: t("navigation.bond.title"),
          description: "",
        },
        stats: {
          title: t("navigation.stats.title"),
          description: t("navigation.stats.description"),
        },
        statsOverview: {
          title: t("navigation.statsOverview.title"),
          description: "",
        },
        statsTreasury: {
          title: t("navigation.statsTreasury.title"),
          description: "",
        },
        staking: {
          title: t("navigation.staking.title"),
          description: t("navigation.staking.description"),
        },
        stakingDashboard: {
          title: t("navigation.stakingDashboard.title"),
          description: "",
        },
        stakingGovernance: {
          title: t("navigation.stakingGovernance.title"),
          description: "",
        },
        referrals: {
          title: t("navigation.referrals.title"),
          description: "",
        },
        borrow: {
          title: t("navigation.borrow.title"),
          description: "",
        },
        memepad: {
          title: t("navigation.memepad.title"),
          description: "",
        },
        submitTransaction: {
          title: t("navigation.submitTransaction.title"),
          description: "",
        },
      }) satisfies Record<
        NavigationKey,
        { title: string; description: string }
      >,
    [t],
  )
}

export const useVisibleHeaderMenuItems = () => {
  const hasTopNavbar = useHasTopNavbar()
  const { hiddenElementsKeys, observe } = useVisibleElements()

  return useMemo(() => {
    const order = hasTopNavbar ? topNavOrder : bottomNavOrder
    const items = NAVIGATION.toSorted(
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
  }, [hiddenElementsKeys, observe, hasTopNavbar])
}
