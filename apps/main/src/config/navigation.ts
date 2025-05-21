import {
  PixelDollarBadge,
  TwoColorCirclePercentage,
  TwoColorClock,
  TwoColorSwap,
  TwoColorUsers,
} from "@galacticcouncil/ui/assets/icons"

export const LINKS = {
  home: "/",
  liquidity: "/liquidity",
  myLiquidity: "/liquidity",
  pools: "/liquidity",
  omnipool: "/liquidity/omnipool-stablepools",
  isolated: "/liquidity/isolated",
  lbp: "/liquidity/lbp",
  swap: "/trade/swap/market",
  wallet: "/wallet",
  walletAssets: "/wallet/assets",
  walletTransactions: "/wallet/transactions",
  crossChain: "/cross-chain",
  bridge: "/bridge",
  trade: "/trade",
  otc: "/trade/otc",
  dca: "/trade/dca",
  yieldDca: "/trade/yield-dca",
  bonds: "/trade/bonds",
  bond: "/trade/bond",
  stats: "/stats",
  statsOverview: "/stats/overview",
  statsTreasury: "/stats/treasury",
  staking: "/staking",
  stakingDashboard: "/staking/dashboard",
  stakingGovernance: "/staking/governance",
  referrals: "/referrals",
  borrow: "/borrow",
  memepad: "/memepad",
  submitTransaction: "/submit-transaction",
}

export type NavigationKey = keyof typeof LINKS

export type NavigationItem = {
  key: NavigationKey
  to: string
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
      { key: "dca", icon: TwoColorClock, to: LINKS.dca },
      { key: "yieldDca", icon: TwoColorCirclePercentage, to: LINKS.yieldDca },
      { key: "otc", icon: TwoColorUsers, to: LINKS.otc },
      { key: "bonds", icon: PixelDollarBadge, to: LINKS.bonds },
    ],
  },
  {
    key: "borrow",
    to: LINKS.borrow,
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
  {
    key: "stats",
    to: LINKS.stats,
    children: [
      { key: "statsOverview", to: LINKS.statsOverview },
      { key: "statsTreasury", to: LINKS.statsTreasury },
    ],
  },
  {
    key: "staking",
    to: LINKS.staking,
  },
  {
    key: "referrals",
    to: LINKS.referrals,
  },
  {
    key: "memepad",
    to: LINKS.memepad,
  },
]

export const topNavOrder: ReadonlyArray<NavigationKey> = [
  "trade",
  "borrow",
  "liquidity",
  "wallet",
  "crossChain",
  "stats",
  "staking",
  "referrals",
  "memepad",
]
export const bottomNavOrder: ReadonlyArray<NavigationKey> = [
  "wallet",
  "trade",
  "liquidity",
  "borrow",
  "crossChain",
  "stats",
  "staking",
  "referrals",
  "memepad",
]

export const NAV_ITEMS_SHOWN_MOBILE = 4
export const NAV_ITEMS_SHOWN_TABLET = 5
