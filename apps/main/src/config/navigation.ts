import { ResponsiveStyleValue } from "@galacticcouncil/ui/types"

export const LINKS = {
  // t('navigation.home')
  home: "/",
  // t('navigation.liquidity')
  liquidity: "/liquidity",
  // t('navigation.myLiquidity')
  myLiquidity: "/liquidity/my-liquidity",
  // t('navigation.allPools')
  allPools: "/liquidity/all-pools",
  // t('navigation.omnipool')
  omnipool: "/liquidity/omnipool-stablepools",
  // t('navigation.isolated')
  isolated: "/liquidity/isolated",
  // t('navigation.lbp')
  lbp: "/liquidity/lbp",
  // t('navigation.swap')
  swap: "/trade/swap",
  // t('navigation.wallet')
  wallet: "/wallet",
  // t('navigation.walletAssets')
  walletAssets: "/wallet/assets",
  // t('navigation.walletTransactions')
  walletTransactions: "/wallet/transactions",
  // t('navigation.walletVesting')
  walletVesting: "/wallet/vesting",
  // t('navigation.crossChain')
  crossChain: "/cross-chain",
  // t('navigation.bridge')
  bridge: "/bridge",
  // t('navigation.trade')
  trade: "/trade",
  // t('navigation.otc')
  otc: "/trade/otc",
  // t('navigation.dca')
  dca: "/trade/dca",
  // t('navigation.yieldDca')
  yieldDca: "/trade/yield-dca",
  // t('navigation.bonds')
  bonds: "/trade/bonds",
  // t('navigation.bond')
  bond: "/trade/bond",
  // t('navigation.stats')
  stats: "/stats",
  // t('navigation.statsOverview')
  statsOverview: "/stats/overview",
  // t('navigation.statsPOL')
  statsPOL: "/stats/treasury",
  // t('navigation.statsLRNA')
  statsLRNA: "/stats/LRNA",
  // t('navigation.statsOmnipool')
  statsOmnipool: "/stats/asset",
  // t('navigation.staking')
  staking: "/staking",
  // t('navigation.stakingDashboard')
  stakingDashboard: "/staking/dashboard",
  // t('navigation.stakingGovernance')
  stakingGovernance: "/staking/governance",
  // t('navigation.referrals')
  referrals: "/referrals",
  // t('navigation.memepad')
  memepad: "/memepad",
  // t('navigation.submitTransaction')
  submitTransaction: "/submit-transaction",
}

type NavigationItem = {
  key: keyof typeof LINKS
  href: string
  enabled?: boolean
  order?: ResponsiveStyleValue<number>
  children?: NavigationItem[]
}

export const NAVIGATION: NavigationItem[] = [
  {
    key: "trade",
    href: LINKS.trade,
    children: [
      { key: "swap", href: LINKS.swap },
      { key: "dca", href: LINKS.dca },
      { key: "yieldDca", href: LINKS.yieldDca },
      { key: "otc", href: LINKS.otc },
      { key: "bonds", href: LINKS.bonds },
    ],
    order: [1],
  },
  {
    key: "liquidity",
    href: LINKS.liquidity,
    order: [2],
    children: [
      { key: "myLiquidity", href: LINKS.myLiquidity },
      { key: "allPools", href: LINKS.allPools },
      { key: "omnipool", href: LINKS.omnipool },
      { key: "isolated", href: LINKS.isolated },
      { key: "lbp", href: LINKS.lbp },
    ],
  },
  {
    key: "wallet",
    href: LINKS.wallet,
    order: [3],
    children: [
      { key: "walletAssets", href: LINKS.walletAssets },
      { key: "walletTransactions", href: LINKS.walletTransactions },
      { key: "walletVesting", href: LINKS.walletVesting },
    ],
  },
  {
    key: "crossChain",
    href: LINKS.crossChain,
    order: [5, 4],
  },
  {
    key: "stats",
    href: LINKS.stats,
    order: [3, 5],
    children: [
      { key: "statsOverview", href: LINKS.statsOverview },
      { key: "statsPOL", href: LINKS.statsPOL },
      { key: "statsLRNA", href: LINKS.statsLRNA },
      { key: "statsOmnipool", href: LINKS.statsOmnipool },
    ],
  },
  {
    key: "staking",
    href: LINKS.staking,
    order: [4, 6],
  },
  {
    key: "referrals",
    href: LINKS.referrals,
    order: [7],
  },
  {
    key: "memepad",
    href: LINKS.memepad,
    order: [8],
  },
] as const
