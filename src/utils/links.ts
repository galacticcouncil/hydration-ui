export const LINKS = {
  home: "/",
  pools: "/pools",
  wallet: "/wallet",
}

export const EXTERNAL_LINKS = {
  lbp: `${import.meta.env.VITE_DOMAIN_URL}/#/lbp`,
  swap: `${import.meta.env.VITE_DOMAIN_URL}/#/swap`,
  wallet: `${import.meta.env.VITE_DOMAIN_URL}/#/wallet`,
  bridge: `https://docs.bsx.fi/howto_bridge/`,
} as const
