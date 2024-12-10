import { useTranslation } from "react-i18next"

import { LINKS } from "@/config/navigation"

export const useMenuTranslations = () => {
  const { t } = useTranslation(["common"])
  return {
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
      description: "",
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
      description: "",
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
      description: "",
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
  } satisfies Record<keyof typeof LINKS, { title: string; description: string }>
}
