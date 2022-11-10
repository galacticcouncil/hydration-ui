export const LINKS = {
  home: "/",
  pools_and_farms: "/pools-and-farms",
  wallet: "/wallet",
  walletAssets: "/wallet/assets",
  walletTransactions: "/wallet/transactions",
  walletVesting: "/wallet/vesting",
}

export const EXTERNAL_LINKS = {
  lbp: `${import.meta.env.VITE_DOMAIN_URL}/#/lbp`,
  swap: `${import.meta.env.VITE_DOMAIN_URL}/#/swap`,
  wallet: `${import.meta.env.VITE_DOMAIN_URL}/#/wallet`,
  bridge: `https://docs.bsx.fi/howto_bridge/`,
} as const

const isWalletPageEnabled = import.meta.env.VITE_FF_WALLET_ENABLED === "true"

export const MENU_ITEMS = [
  {
    key: "wallet",
    translationKey: "header.wallet",
    href: isWalletPageEnabled ? LINKS.wallet : EXTERNAL_LINKS.wallet,
    external: !isWalletPageEnabled,
    mobVisible: true,
  },
] as const

/*export const MENU_ITEMS = [
{
    key: "lbp",
    translationKey: "header.lbp",
    href: EXTERNAL_LINKS.lbp,
    external: true,
    mobVisible: false,
  },
  {
    key: "trade",
    translationKey: "header.trade",
    href: EXTERNAL_LINKS.swap,
    external: true,
    mobVisible: true,
  },
  {
    key: "pools",
    translationKey: "header.pools",
    href: LINKS.pools_and_farms,
    external: false,
    mobVisible: true,
  },
  {
    key: "wallet",
    translationKey: "header.wallet",
    href: isWalletPageEnabled ? LINKS.wallet : EXTERNAL_LINKS.wallet,
    external: !isWalletPageEnabled,
    mobVisible: true,
  },
  {
    key: "bridge",
    translationKey: "header.bridge",
    href: EXTERNAL_LINKS.bridge,
    external: true,
    mobVisible: false,
  },
] as const*/

export type TabKeys = typeof MENU_ITEMS[number]["key"]
export type TabObject = typeof MENU_ITEMS[number]
