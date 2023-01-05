export const LINKS = {
  home: "/",
  liquidity: "/liquidity",
  trade: "/trade",
  wallet: "/wallet",
  walletAssets: "/wallet/assets",
  walletTransactions: "/wallet/transactions",
  walletVesting: "/wallet/vesting",
  transfer: "/transfer",
}

export const EXTERNAL_LINKS = {
  lbp: `${import.meta.env.VITE_DOMAIN_URL}/#/lbp`,
  swap: `${import.meta.env.VITE_DOMAIN_URL}/#/swap`,
  wallet: `${import.meta.env.VITE_DOMAIN_URL}/#/wallet`,
  bridge: `https://docs.bsx.fi/howto_bridge/`,
} as const

const isPoolsPageEnabled = import.meta.env.VITE_FF_POOLS_ENABLED === "true"
const isXcmPageEnabled = import.meta.env.VITE_FF_XCM_ENABLED === "true"

export const MENU_ITEMS = [
  {
    key: "trade",
    translationKey: "header.trade",
    href: LINKS.trade,
    enabled: true,
    external: false,
    mobVisible: true,
    mobOrder: 0,
  },
  {
    key: "pools",
    translationKey: "header.liquidity",
    href: LINKS.liquidity,
    enabled: isPoolsPageEnabled,
    external: false,
    mobVisible: true,
    mobOrder: 2,
  },
  {
    key: "wallet",
    translationKey: "header.wallet",
    href: LINKS.wallet,
    enabled: true,
    external: false,
    mobVisible: true,
    mobOrder: 1,
  },
  {
    key: "transfer",
    translationKey: "header.transfer",
    href: LINKS.transfer,
    enabled: isXcmPageEnabled,
    external: false,
    mobVisible: false,
    mobOrder: 3,
  },
] as const

export type TabKeys = typeof MENU_ITEMS[number]["key"]
export type TabObject = typeof MENU_ITEMS[number]
