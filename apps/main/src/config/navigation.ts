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
  myLiquidity: "/liquidity/my-liquidity",
  allPools: "/liquidity/all-pools",
  omnipool: "/liquidity/omnipool-stablepools",
  isolated: "/liquidity/isolated",
  lbp: "/liquidity/lbp",
  swap: "/trade/swap",
  wallet: "/wallet",
  walletAssets: "/wallet/assets",
  walletTransactions: "/wallet/transactions",
  walletVesting: "/wallet/vesting",
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
      { key: "myLiquidity", to: LINKS.myLiquidity },
      { key: "allPools", to: LINKS.allPools },
      { key: "omnipool", to: LINKS.omnipool },
      { key: "isolated", to: LINKS.isolated },
      { key: "lbp", to: LINKS.lbp },
    ],
  },
  {
    key: "wallet",
    to: LINKS.wallet,
    children: [
      { key: "walletAssets", to: LINKS.walletAssets },
      { key: "walletTransactions", to: LINKS.walletTransactions },
      { key: "walletVesting", to: LINKS.walletVesting },
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

export const desktopNavOrder: ReadonlyArray<NavigationKey> = [
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
export const mobileNavOrder: ReadonlyArray<NavigationKey> = [
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
