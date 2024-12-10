import {
  PixelDollarBadge,
  TwoColorCirclePercentage,
  TwoColorClock,
  TwoColorSwap,
  TwoColorUsers,
} from "@galacticcouncil/ui/assets/icons"
import { ResponsiveStyleValue } from "@galacticcouncil/ui/types"

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

type NavigationItem = {
  key: keyof typeof LINKS
  to: string
  icon?: React.ComponentType
  enabled?: boolean
  order?: ResponsiveStyleValue<number>
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
    order: [1],
  },
  {
    key: "borrow",
    to: LINKS.borrow,
    order: [2],
  },
  {
    key: "liquidity",
    to: LINKS.liquidity,
    order: [3],
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
    order: [4],
    children: [
      { key: "walletAssets", to: LINKS.walletAssets },
      { key: "walletTransactions", to: LINKS.walletTransactions },
      { key: "walletVesting", to: LINKS.walletVesting },
    ],
  },
  {
    key: "crossChain",
    to: LINKS.crossChain,
    order: [5],
  },
  {
    key: "stats",
    to: LINKS.stats,
    order: [3, 6],
    children: [
      { key: "statsOverview", to: LINKS.statsOverview },
      { key: "statsTreasury", to: LINKS.statsTreasury },
    ],
  },
  {
    key: "staking",
    to: LINKS.staking,
    order: [4, 7],
  },
  {
    key: "referrals",
    to: LINKS.referrals,
    order: [8],
  },
  {
    key: "memepad",
    to: LINKS.memepad,
    order: [9],
  },
] as const
