import { TwoColorSwap, TwoColorUsers } from "@galacticcouncil/ui/assets/icons"

import { FileRouteTypes } from "@/routeTree.gen"

type Route = FileRouteTypes["to"]

export const LINKS = {
  home: "/",
  liquidity: "/liquidity",
  myLiquidity: "/liquidity",
  pools: "/liquidity",
  swap: "/trade/swap/market",
  wallet: "/wallet",
  walletAssets: "/wallet/assets",
  walletTransactions: "/wallet/transactions",
  crossChain: "/cross-chain",
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
    children: [
      { key: "swap", icon: TwoColorSwap, to: LINKS.swap },
      { key: "otc", icon: TwoColorUsers, to: LINKS.otc },
    ],
  },
  {
    key: "borrow",
    to: LINKS.borrow,
    children: [
      { key: "borrowDashboard", to: LINKS.borrowDashboard },
      { key: "borrowMarkets", to: LINKS.borrowMarkets },
      { key: "borrowHistory", to: LINKS.borrowHistory },
    ],
  },
  {
    key: "liquidity",
    to: LINKS.liquidity,
    children: [
      {
        key: "myLiquidity",
        to: LINKS.liquidity,
        search: { myLiquidity: true },
      },
      { key: "pools", to: LINKS.liquidity, search: { myLiquidity: false } },
    ],
  },
  {
    key: "wallet",
    to: LINKS.wallet,
    children: [
      { key: "walletAssets", to: LINKS.walletAssets },
      { key: "walletTransactions", to: LINKS.walletTransactions },
    ],
  },
  {
    key: "crossChain",
    to: LINKS.crossChain,
  },
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

export const topNavOrder: ReadonlyArray<NavigationKey> = [
  "trade",
  "borrow",
  "liquidity",
  "wallet",
  "crossChain",
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
  "crossChain",
  // "stats",
  "staking",
  // "referrals",
  // "memepad",
]

export const NAV_ITEMS_SHOWN_MOBILE = 4
export const NAV_ITEMS_SHOWN_TABLET = 5
