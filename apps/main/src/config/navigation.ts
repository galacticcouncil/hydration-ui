import {
  ArrowRightLeftIcon,
  BanknoteIcon,
  ChartPieIcon,
  CoinsIcon,
  DropletIcon,
  DropletsIcon,
  Grid2X2Icon,
  HistoryIcon,
  WalletCardsIcon,
  WavesIcon,
} from "@galacticcouncil/ui/assets/icons"
import { TFunction } from "i18next"

import { FileRouteTypes } from "@/routeTree.gen"
import { getDeployPreviewId } from "@/utils/deploy"

type Route = FileRouteTypes["to"]

export const LINKS = {
  home: "/",
  liquidity: "/liquidity",
  myLiquidity: "/liquidity",
  pools: "/liquidity",
  swap: "/trade/swap",
  wallet: "/wallet",
  walletAssets: "/wallet/assets",
  walletTransactions: "/wallet/transactions",
  // crossChain: "/cross-chain",
  // bridge: "/bridge",
  trade: "/trade",
  otc: "/trade/otc",
  // stats: "/stats",
  // statsOverview: "/stats/overview",
  // statsTreasury: "/stats/treasury",
  staking: "/staking",
  // stakingDashboard: "/staking/dashboard",
  // stakingGovernance: "/staking/governance",
  // referrals: "/referrals",
  borrow: "/borrow",
  borrowDashboard: "/borrow/dashboard",
  borrowMarkets: "/borrow/markets",
  borrowHistory: "/borrow/history",
  // memepad: "/memepad",
  // submitTransaction: "/submit-transaction",
} satisfies Record<string, Route>

export type NavigationKey = keyof typeof LINKS

export type NavigationItem = {
  key: NavigationKey
  to: Route
  icon?: React.ComponentType
  enabled?: boolean
  children?: NavigationItem[]
  search?: Record<string, string | boolean>
}

export const NAVIGATION: NavigationItem[] = [
  {
    key: "trade",
    to: LINKS.trade,
    icon: ArrowRightLeftIcon,
    children: [
      { key: "swap", to: LINKS.swap, icon: ArrowRightLeftIcon },
      { key: "otc", to: LINKS.otc, icon: CoinsIcon },
    ],
  },
  {
    key: "borrow",
    to: LINKS.borrow,
    icon: BanknoteIcon,
    children: [
      { key: "borrowDashboard", to: LINKS.borrowDashboard, icon: ChartPieIcon },
      { key: "borrowMarkets", to: LINKS.borrowMarkets, icon: Grid2X2Icon },
      { key: "borrowHistory", to: LINKS.borrowHistory, icon: HistoryIcon },
    ],
  },
  {
    key: "liquidity",
    to: LINKS.liquidity,
    icon: DropletIcon,
    children: [
      {
        key: "myLiquidity",
        to: LINKS.liquidity,
        icon: DropletsIcon,
        search: { myLiquidity: true },
      },
      {
        key: "pools",
        to: LINKS.liquidity,
        search: { myLiquidity: false },
        icon: WavesIcon,
      },
    ],
  },
  {
    key: "wallet",
    to: LINKS.wallet,
    icon: WalletCardsIcon,
    children: [
      { key: "walletAssets", to: LINKS.walletAssets },
      // { key: "walletTransactions", to: LINKS.walletTransactions },
    ],
  },
  // {
  //   key: "crossChain",
  //   to: LINKS.crossChain,
  // },
  // {
  //   key: "stats",
  //   to: LINKS.stats,
  //   children: [
  //     { key: "statsOverview", to: LINKS.statsOverview },
  //     { key: "statsTreasury", to: LINKS.statsTreasury },
  //   ],
  // },
  {
    key: "staking",
    to: LINKS.staking,
  },
  // {
  //   key: "referrals",
  //   to: LINKS.referrals,
  // },
  // {
  //   key: "memepad",
  //   to: LINKS.memepad,
  // },
]

export const getMenuTranslations = (t: TFunction) =>
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
    pools: {
      title: t("navigation.pools.title"),
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
    // crossChain: {
    //   title: t("navigation.crossChain.title"),
    //   description: "",
    // },
    // bridge: {
    //   title: t("navigation.bridge.title"),
    //   description: "",
    // },
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
    // stats: {
    //   title: t("navigation.stats.title"),
    //   description: t("navigation.stats.description"),
    // },
    // statsOverview: {
    //   title: t("navigation.statsOverview.title"),
    //   description: "",
    // },
    // statsTreasury: {
    //   title: t("navigation.statsTreasury.title"),
    //   description: "",
    // },
    staking: {
      title: t("navigation.staking.title"),
      description: t("navigation.staking.description"),
    },
    // stakingDashboard: {
    //   title: t("navigation.stakingDashboard.title"),
    //   description: "",
    // },
    // stakingGovernance: {
    //   title: t("navigation.stakingGovernance.title"),
    //   description: "",
    // },
    // referrals: {
    //   title: t("navigation.referrals.title"),
    //   description: "",
    // },
    borrow: {
      title: t("navigation.borrow.title"),
      description: "",
    },
    borrowDashboard: {
      title: t("navigation.borrowDashboard.title"),
      description: t("navigation.borrowDashboard.description"),
    },
    borrowMarkets: {
      title: t("navigation.borrowMarkets.title"),
      description: "",
    },
    borrowHistory: {
      title: t("navigation.borrowHistory.title"),
      description: t("navigation.borrowHistory.description"),
    },
    // memepad: {
    //   title: t("navigation.memepad.title"),
    //   description: "",
    // },
    // submitTransaction: {
    //   title: t("navigation.submitTransaction.title"),
    //   description: "",
    // },
  }) satisfies Record<NavigationKey, { title: string; description: string }>

export const getPageMeta = (navKey: NavigationKey, t: TFunction) => {
  const previewId = getDeployPreviewId()
  const translations = getMenuTranslations(t)

  const { title, description } = translations[navKey]
  const globalTitle = t("meta.title")
  const fullTitle = title ? `${title} | ${globalTitle}` : globalTitle

  if (previewId) {
    return [
      {
        title: `PR${previewId} | ${fullTitle}`,
      },
    ]
  }
  return [
    {
      title: fullTitle,
    },
    {
      name: "description",
      content: description || t("meta.description"),
    },
  ]
}

export const topNavOrder: ReadonlyArray<NavigationKey> = [
  "trade",
  "borrow",
  "liquidity",
  "wallet",
  // "crossChain",
  // "stats",
  "staking",
  // "referrals",
  // "memepad",
]
export const bottomNavOrder: ReadonlyArray<NavigationKey> = [
  "wallet",
  "trade",
  "liquidity",
  "borrow",
  // "crossChain",
  // "stats",
  "staking",
  // "referrals",
  // "memepad",
]

export const NAV_ITEMS_SHOWN_MOBILE = 4
export const NAV_ITEMS_SHOWN_TABLET = 5
