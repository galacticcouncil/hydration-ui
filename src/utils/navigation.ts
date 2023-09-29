import PoolsAndFarmsIcon from "assets/icons/PoolsAndFarms.svg?react"
import TradeIcon from "assets/icons/Trade.svg?react"
import TransferIcon from "assets/icons/TransferTabIcon.svg?react"
import WalletIcon from "assets/icons/Wallet.svg?react"
import IconDCA from "assets/icons/navigation/IconDCA.svg?react"
import IconOTC from "assets/icons/navigation/IconOTC.svg?react"
import IconSwap from "assets/icons/navigation/IconSwap.svg?react"
import StatsIcon from "assets/icons/ChartIcon.svg?react"
import StakingIcon from "assets/icons/StakingIcon.svg?react"

export const LINKS = {
  home: "/",
  liquidity: "/liquidity",
  trade: "/trade",
  wallet: "/wallet",
  walletAssets: "/wallet/assets",
  walletTransactions: "/wallet/transactions",
  walletVesting: "/wallet/vesting",
  cross_chain: "/cross-chain",
  otc: "/otc",
  dca: "/dca",
  stats: "/stats",
  statsOverview: "/stats/overview",
  statsPOL: "/stats/POL",
  statsLRNA: "/stats/LRNA",
  statsOmnipool: "/stats/overview/omnipool",
  staking: "/staking",
  stakingDashboard: "/staking/dashboard",
  stakingGovernance: "/staking/governance",
}

const isPoolsPageEnabled = import.meta.env.VITE_FF_POOLS_ENABLED === "true"
const isXcmPageEnabled = import.meta.env.VITE_FF_XCM_ENABLED === "true"
const isOtcPageEnabled = import.meta.env.VITE_FF_OTC_ENABLED === "true"
const isDcaPageEnabled = import.meta.env.VITE_FF_DCA_ENABLED === "true"
const isStatsEnabled = import.meta.env.VITE_FF_STATS_ENABLED === "true"
const isStakingEnabled = import.meta.env.VITE_FF_STAKING_ENABLED === "true"

export const MENU_ITEMS = [
  {
    key: "trade",
    href: undefined,
    Icon: TradeIcon,
    subItems: [
      { key: "swap", href: LINKS.trade, Icon: IconSwap, enabled: true },
      { key: "dca", href: LINKS.dca, Icon: IconDCA, enabled: isDcaPageEnabled },
      { key: "otc", href: LINKS.otc, Icon: IconOTC, enabled: isOtcPageEnabled },
    ],
    enabled: true,
    external: false,
    mobVisible: true,
    tabVisible: true,
    mobOrder: 1,
  },
  {
    key: "liquidity",
    href: LINKS.liquidity,
    Icon: PoolsAndFarmsIcon,
    subItems: undefined,
    enabled: isPoolsPageEnabled,
    external: false,
    mobVisible: true,
    tabVisible: true,
    mobOrder: 2,
  },
  {
    key: "wallet",
    href: LINKS.walletAssets,
    Icon: WalletIcon,
    subItems: undefined,
    enabled: true,
    external: false,
    mobVisible: true,
    tabVisible: true,
    mobOrder: 0,
  },
  {
    key: "xcm",
    href: LINKS.cross_chain,
    Icon: TransferIcon,
    subItems: undefined,
    enabled: isXcmPageEnabled,
    external: false,
    mobVisible: false,
    tabVisible: false,
    mobOrder: 5,
  },
  {
    key: "stats",
    href: LINKS.stats,
    Icon: StatsIcon,
    subItems: undefined,
    enabled: isStatsEnabled,
    external: false,
    mobVisible: false,
    tabVisible: true,
    mobOrder: 3,
  },
  {
    key: "staking",
    href: LINKS.staking,
    Icon: StakingIcon,
    subItems: undefined,
    enabled: isStakingEnabled,
    external: false,
    mobVisible: false,
    tabVisible: true,
    mobOrder: 4,
  },
] as const

export type TabItem = (typeof MENU_ITEMS)[number]
export type TabSubItem = (typeof MENU_ITEMS)[number]["subItems"]
export type TabItemWithSubItems = TabItem & {
  subItems: NonNullable<TabSubItem>
}
